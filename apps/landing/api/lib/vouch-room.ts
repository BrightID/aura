// The store behind Vouch's shared practice rooms. Each room holds one slot,
// { version, generation, world }. Ported from the standalone vouch-app
// (BrightID/vouch-app, api/_store.js), which kept the same slots in Redis.
// - A write names the version it was based on, and is refused if anyone wrote since.
// - A reset raises the generation, and writes from an older generation are
//   refused, so a stale tab can't bring back a world that was reset.
// Rooms hold practice data only; nothing here touches the BrightID network.
import type { VercelRequest } from '@vercel/node';
import { sql } from './db.js';

export const MAX_WORLD_BYTES = 300_000;
// The world's parts, as in apps/vouch/src/model/world.ts. validWorld checks
// that each one present is an object. Other parts pass unchecked, so the app
// can add parts without a server change.
const PARTS = [
  'identities',
  'answers',
  'outgoing',
  'arrivalCodes',
  'invites',
  'playerRequests',
  'nodes',
  'nameGrants',
  'controlRelationships',
  'nodesComplete',
  'sharedControlAnswered',
  'arrivalRole',
  'teamAsked',
  'nodeAnswered',
  'nodeAddress',
  'nodeReady',
  'nameVisibility',
];
// A write deletes rooms not written to for this long, claims made this long
// ago, and presence rows not refreshed for this long.
const KEEP_DAYS = 14;
// A browser counts as present this long after its last heartbeat.
const PRESENT_SECONDS = 30;

const plain = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);

/** Why `world` can't be stored, or null when it can. */
export function validWorld(world: unknown) {
  if (!plain(world)) return 'world must be an object';
  for (const part of PARTS)
    if (part in world && !plain(world[part]))
      return `world.${part} must be an object`;
  if (JSON.stringify(world).length > MAX_WORLD_BYTES) return 'world too large';
  return null;
}

/** The `room` query parameter, or null unless it is 3–40 lowercase letters, digits or dashes. */
export function roomFrom(req: VercelRequest) {
  const room = req.query.room;
  return typeof room === 'string' && /^[a-z0-9-]{3,40}$/.test(room)
    ? room
    : null;
}

export interface Slot {
  version: number;
  generation: number;
  world: unknown;
}

// Generations start at 1: the app treats 0 as "not loaded yet".
const EMPTY: Slot = { version: 0, generation: 1, world: null };

export async function read(room: string): Promise<Slot> {
  const [row] = await sql<
    { version: number; generation: number; world: string | null }[]
  >`
    SELECT version, generation, world FROM vouch_rooms WHERE room = ${room}`;
  if (!row) return { ...EMPTY };
  return {
    version: row.version,
    generation: row.generation,
    world: row.world ? JSON.parse(row.world) : null,
  };
}

/**
 * Store `world` if the room is still at `baseVersion` and `generation`.
 * `reset` skips the generation check and starts a new generation.
 * On a conflict, returns the room's current slot instead.
 */
export async function write(
  room: string,
  baseVersion: number,
  generation: number,
  world: unknown,
  reset = false,
): Promise<({ ok: true } & Omit<Slot, 'world'>) | ({ ok: false } & Slot)> {
  await sql`INSERT INTO vouch_rooms (room) VALUES (${room}) ON CONFLICT DO NOTHING`;
  const [row] = await sql<{ version: number; generation: number }[]>`
    UPDATE vouch_rooms
    SET version = version + 1,
        generation = generation + ${reset ? 1 : 0},
        world = ${world === null ? null : JSON.stringify(world)},
        updated_at = now()
    WHERE room = ${room}
      AND version = ${baseVersion}
      AND (${reset} OR generation = ${generation})
    RETURNING version, generation`;
  if (!row) return { ok: false, ...(await read(room)) };
  await prune();
  return { ok: true, version: row.version, generation: row.generation };
}

// ponytail: prunes on every world write, so a room nobody writes to waits for
// another room's write. Move this to a scheduled job if rooms ever get busy.
async function prune() {
  const cutoff = sql`now() - make_interval(days => ${KEEP_DAYS})`;
  await sql`DELETE FROM vouch_rooms WHERE updated_at < ${cutoff}`;
  await sql`DELETE FROM vouch_claims WHERE created_at < ${cutoff}`;
  await sql`DELETE FROM vouch_presence WHERE seen_at < ${cutoff}`;
}

/** Record that `browserId` is in `room`, playing `persona`. */
export async function beat(room: string, browserId: string, persona: string) {
  await sql`
    INSERT INTO vouch_presence (room, browser_id, persona) VALUES (${room}, ${browserId}, ${persona})
    ON CONFLICT (room, browser_id) DO UPDATE SET persona = excluded.persona, seen_at = now()`;
}

/** The browsers seen in `room` recently, with the persona each is playing. */
export async function present(room: string) {
  const rows = await sql<{ browserId: string; persona: string; at: number }[]>`
    SELECT browser_id AS "browserId", persona,
           (extract(epoch FROM seen_at) * 1000)::float8 AS at
    FROM vouch_presence
    WHERE room = ${room}
      AND seen_at > now() - make_interval(secs => ${PRESENT_SECONDS})
    ORDER BY browser_id`;
  return rows.map((row) => ({ ...row }));
}

/** Claim invite `token` for `id`. Returns whoever holds it: `id` if this call won. */
export async function claim(room: string, token: string, id: string) {
  await sql`
    INSERT INTO vouch_claims (room, token, claimed_by) VALUES (${room}, ${token}, ${id})
    ON CONFLICT DO NOTHING`;
  const [row] = await sql<{ claimedBy: string }[]>`
    SELECT claimed_by AS "claimedBy" FROM vouch_claims
    WHERE room = ${room} AND token = ${token}`;
  return row.claimedBy;
}

export async function clearClaims(room: string) {
  await sql`DELETE FROM vouch_claims WHERE room = ${room}`;
}
