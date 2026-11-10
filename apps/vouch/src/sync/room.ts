// Shared practice rooms: every browser in a room keeps a copy of the practice
// world, sends its changes to the room server (apps/landing/api/vouch), and
// merges in everyone else's. Ported from the standalone vouch-app
// (BrightID/vouch-app, index.html). Practice data only; nothing here touches
// the BrightID network.
import { createSignal } from 'solid-js';
import { produce } from 'solid-js/store';
import type { MockAdapter, PracticeState } from '@/adapter/mock';
import { FOUNDING_TEAM } from '@/model/seed';
import {
  PERSON_PARTS,
  cleanWorld,
  emptyWorld,
  keepAfterReset,
  mergeWorld,
  recordKey,
  stampedWorld,
  worldKey,
  type Records,
  type StampedRecord,
  type World,
  type WorldRecord,
} from '@/model/world';

const LIST_PARTS = [
  'answers',
  'outgoing',
  'playerRequests',
  'nameGrants',
] as const;

/** The adapter's shared state as world records, under the keys the world uses for each part. */
export function stateRecords(api: MockAdapter): Records {
  const s = api.state;
  const records = emptyWorld<WorldRecord>();
  for (const [id, identity] of Object.entries(s.identities))
    records.identities[id] = { ...identity };
  for (const part of LIST_PARTS)
    for (const item of s[part])
      records[part][recordKey[part](item)] = structuredClone({ ...item });
  for (const [code, item] of Object.entries(s.arrivalCodes))
    records.arrivalCodes[code] = { ...item };
  for (const [token, item] of Object.entries(s.invites))
    records.invites[token] = { ...item };
  for (const [owner, nodes] of Object.entries(s.nodes))
    nodes.forEach((node, index) => {
      const id = node.id || `seed-${index}`;
      records.nodes[recordKey.nodes({ owner, id })] = { ...node, owner, id };
    });
  for (const [owner, controllers] of Object.entries(s.controlRelationships))
    for (const controller of controllers)
      records.controlRelationships[worldKey(owner, controller)] = {
        owner,
        controller,
      };
  for (const part of PERSON_PARTS)
    for (const [id, value] of Object.entries(s[part]))
      records[part][id] = { value: structuredClone(value) };
  return records;
}

const payload = ({
  updatedAt: _u,
  by: _b,
  removed: _r,
  ...value
}: StampedRecord) => value;
const live = (records: Record<string, StampedRecord>) =>
  Object.entries(records).filter(([, x]) => !x.removed);

/**
 * Replace the adapter's shared state with `next`, after dropping malformed
 * records. Also works out promotions from the shared answers, and signs the
 * persona out if `next` no longer has them. Returns the cleaned world.
 */
export function applyWorld(api: MockAdapter, next: unknown): World {
  const world = cleanWorld(next);
  const operators = new Set(api.data.operators.map(([id]) => id));
  api.setState(
    produce((s: PracticeState) => {
      for (const part of LIST_PARTS)
        // oxlint-disable-next-line typescript/no-explicit-any -- each part's records were checked by cleanWorld
        s[part] = live(world[part]).map(([, x]) => payload(x)) as any;
      s.arrivalCodes = Object.fromEntries(
        live(world.arrivalCodes).map(([k, x]) => [k, payload(x) as never]),
      );
      s.invites = Object.fromEntries(
        live(world.invites).map(([k, x]) => [k, payload(x) as never]),
      );
      s.nodes = {};
      for (const [, x] of live(world.nodes))
        (s.nodes[x.owner] ||= []).push(payload(x) as never);
      s.nodeDeclared = Object.fromEntries(
        Object.keys(s.nodes)
          .filter((id) => !operators.has(id))
          .map((id) => [id, true]),
      );
      s.controlRelationships = {};
      for (const [, x] of live(world.controlRelationships))
        (s.controlRelationships[x.owner] ||= []).push(x.controller);
      for (const part of PERSON_PARTS)
        (s as unknown as Record<string, unknown>)[part] = Object.fromEntries(
          live(world[part]).map(([k, x]) => [k, x.value]),
        );
      s.identities = Object.fromEntries(
        live(world.identities).map(([id, x]) => [
          id,
          { name: x.name, createdAt: x.createdAt ?? 0 },
        ]),
      );
      s.playerReady = {};
      for (const a of s.answers)
        if (a.role === 'player' && a.yes) s.playerReady[a.subject] = true;
      s.promotedRoles = {};
    }),
  );
  // Promotions are worked out from all the room's answers, since the
  // answering browser's adapter doesn't promote in a shared room. Each is set
  // as soon as it is found, as in vouch-app, so someone promoted to manager
  // here already counts as a manager when later people's answers are checked.
  for (const role of ['trainer', 'manager'] as const) {
    const subjects = new Set(
      api.state.answers
        .filter((a) => a.role === role && a.yes && a.domain === 'interfold')
        .map((a) => a.subject),
    );
    for (const subject of subjects) {
      const managers = new Set(
        api.state.answers
          .filter(
            (a) =>
              a.subject === subject &&
              a.domain === 'interfold' &&
              a.role === role &&
              a.yes &&
              (api.getVerifications(a.rater).categories.manager?.level ?? 0) >=
                1,
          )
          .map((a) => a.rater),
      );
      if (managers.size >= 2)
        api.setState(
          produce((s: PracticeState) => {
            ((s.promotedRoles[subject] ||= {}).interfold ||= {})[role] = 1;
          }),
        );
    }
  }
  const { persona, identities } = api.state;
  if (persona !== 'newcomer' && !api.data.ids[persona] && !identities[persona])
    api.setState('persona', 'newcomer');
  return world;
}

/** A browser in the room, as the server reports it. */
export interface Presence {
  browserId: string;
  persona: string;
  at: number;
}

interface Slot {
  version: number;
  generation: number;
  world: unknown;
}

export interface RoomOptions {
  api: MockAdapter;
  room: string;
  /** This browser's id in presence. The caller should store it (for example in localStorage), or each reload shows up as another browser. */
  browserId?: string;
  /** Where the room server is. */
  base?: string;
  fetch?: typeof globalThis.fetch;
  /** How long to wait after a change before sending it, in ms. */
  pushDelay?: number;
  /**
   * Runs when another browser reset the room. The callback should undo any
   * answer still in its undo window, so it doesn't land in the new world, and
   * close what the screens had open.
   */
  onReset?: () => void;
}

const json = { 'Content-Type': 'application/json' };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const NOT_SYNCED = 'Not synced · retrying';

/**
 * Keep `api`'s shared state in step with `room`. Call `start()` to begin
 * polling, and wire `commit` to the adapter's `onCommit`, so each change is
 * sent to the room.
 */
export function createRoomSync({
  api,
  room,
  browserId = `browser_${crypto.randomUUID().replace(/-/g, '')}`,
  base = '/api/vouch',
  fetch = globalThis.fetch,
  pushDelay = 300,
  onReset,
}: RoomOptions) {
  const q = `?room=${encodeURIComponent(room)}`;
  const worldURL = `${base}/world${q}`;
  const seedWorld = stampedWorld(stateRecords(api), emptyWorld(), 'seed', 0);
  let world = structuredClone(seedWorld);
  let lastServer = emptyWorld();
  let version = 0;
  // 0 until the first read: the app has not seen the room yet.
  let generation = 0;
  let dirty = false;
  let inflight: Promise<void> | null = null;
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  const [status, setStatus] = createSignal('');
  const [here, setHere] = createSignal<Presence[]>([]);
  const [loaded, setLoaded] = createSignal(false);

  // Records sorted by key, so two copies of one world compare equal.
  const stable = (value: unknown) =>
    JSON.stringify(value, (_, item) =>
      item && !Array.isArray(item) && typeof item === 'object'
        ? Object.fromEntries(
            Object.keys(item)
              .sort()
              .map((key) => [key, item[key]]),
          )
        : item,
    );

  // Later than every stamp in the world, so this change wins the merge even if the clock is behind.
  const nextStamp = () => {
    let highest = 0;
    for (const records of Object.values(world))
      for (const item of Object.values(records))
        if (Number.isFinite(item?.updatedAt))
          highest = Math.max(highest, item.updatedAt);
    return Math.max(Date.now(), highest + 1);
  };

  const schedulePush = (delay = pushDelay) => {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void push(), delay);
  };

  /** Stamp the adapter's changes into the world and send them soon. */
  function commit(actor = api.state.persona) {
    const next = stampedWorld(stateRecords(api), world, actor, nextStamp());
    if (stable(next) === stable(world)) return;
    world = next;
    dirty = true;
    schedulePush();
  }

  function adoptReset(body: Slot) {
    const persona = api.state.persona;
    const identities = (body.world as World | null)?.identities;
    const survives =
      FOUNDING_TEAM.includes(persona) ||
      Boolean(identities?.[persona] && !identities[persona].removed);
    onReset?.();
    lastServer = cleanWorld(body.world);
    dirty = false;
    clearTimeout(pushTimer);
    world = applyWorld(api, mergeWorld(seedWorld, lastServer));
    if (!survives) api.setState('persona', 'newcomer');
    generation = body.generation;
    version = body.version;
  }

  /**
   * Send the world. A refused write is merged and sent again, up to 5 times;
   * after that, or a network error, it tries again later. Concurrent calls share one run.
   */
  function push() {
    inflight ??= send().finally(() => {
      inflight = null;
    });
    return inflight;
  }

  async function send() {
    let retryLater = false;
    for (let attempt = 0; attempt < 5 && dirty; attempt++) {
      const sending = mergeWorld(world, lastServer);
      try {
        const response = await fetch(worldURL, {
          method: 'PUT',
          headers: json,
          body: JSON.stringify({
            baseVersion: version,
            generation,
            world: sending,
          }),
        });
        const body = (await response.json()) as Slot;
        if (response.status === 409) {
          if (
            generation !== 0 &&
            body.generation !== 0 &&
            body.generation !== generation
          ) {
            adoptReset(body);
            break;
          }
          generation = body.generation;
          lastServer = cleanWorld(body.world);
          world = applyWorld(api, mergeWorld(world, lastServer));
          version = body.version;
          // A short random wait, so browsers that collided don't collide again.
          await sleep(30 + Math.random() * 120);
          continue;
        }
        if (!response.ok) throw new Error('sync failed');
        if (body.generation < generation) continue;
        version = body.version;
        generation = body.generation;
        lastServer = sending;
        dirty = stable(world) !== stable(sending);
        setStatus('');
      } catch {
        setStatus(NOT_SYNCED);
        retryLater = true;
        break;
      }
    }
    if (dirty) schedulePush(retryLater ? 2000 : pushDelay);
  }

  /** Read the room, and merge in anything newer than what this browser has. */
  async function poll() {
    try {
      const response = await fetch(worldURL);
      if (!response.ok) throw new Error('sync failed');
      const body = (await response.json()) as Slot;
      if (body.generation < generation) return;
      if (body.generation > generation && generation !== 0) adoptReset(body);
      else if (body.version > version || !loaded()) {
        generation = body.generation;
        lastServer = cleanWorld(body.world);
        setLoaded(true);
        const merged = mergeWorld(world, lastServer);
        // Changes made before the room was read still need sending.
        const hasLocal =
          stable(merged) !== stable(mergeWorld(seedWorld, lastServer));
        world = applyWorld(api, merged);
        version = body.version;
        if (hasLocal) {
          dirty = true;
          schedulePush();
        }
      }
      setStatus('');
    } catch {
      setStatus(NOT_SYNCED);
    }
  }

  /** Tell the room this browser is here, and learn who else is. Advisory: a missed beat stays silent. */
  async function beat() {
    try {
      const response = await fetch(`${base}/presence${q}`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ browserId, persona: api.state.persona }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { here?: Presence[] };
      if (Array.isArray(data.here)) setHere(data.here);
    } catch {
      // ignored: presence is advisory
    }
  }

  /** Claim invite `token` for the new person `id`. Resolves false if someone else claimed it first. */
  async function claim(token: string, id: string) {
    const response = await fetch(`${base}/claim${q}`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ token, id }),
    });
    const result = (await response.json()) as { claimedBy?: string };
    if (response.status === 409) return false;
    if (!response.ok || result.claimedBy !== id)
      throw new Error('claim failed');
    return true;
  }

  /**
   * Start the room over: the practice cast goes back to the seed, and the real
   * people who joined keep their records. Resolves false on a wrong team code.
   */
  async function reset(teamCode: string) {
    const keep = keepAfterReset(mergeWorld(world, lastServer));
    try {
      const response = await fetch(`${base}/world/reset${q}`, {
        method: 'POST',
        headers: json,
        body: JSON.stringify({ teamCode, keep }),
      });
      if (response.status === 403) return false;
      if (!response.ok) throw new Error('reset failed');
      const body = (await response.json()) as Slot;
      adoptReset({ ...body, world: body.world ?? keep });
      return true;
    } catch (error) {
      setStatus(NOT_SYNCED);
      throw error;
    }
  }

  /** Poll the room every 2 s and send presence every 10 s. Returns a function that stops both. */
  function start() {
    void poll();
    void beat();
    const timers = [setInterval(poll, 2000), setInterval(beat, 10000)];
    return () => {
      timers.forEach(clearInterval);
      clearTimeout(pushTimer);
    };
  }

  return {
    browserId,
    /** '' when in step with the room; otherwise a short message to show. */
    status,
    /** The browsers seen in the room in the last 30 s. */
    here,
    /** True once the room has been read. */
    loaded,
    commit,
    push,
    poll,
    beat,
    claim,
    reset,
    start,
  };
}

export type RoomSync = ReturnType<typeof createRoomSync>;
