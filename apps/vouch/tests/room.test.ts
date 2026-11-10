import { describe, expect, test } from 'bun:test';
import { createMockAdapter } from '@/adapter/mock';
import { createSeed } from '@/model/seed';
import { emptyWorld, stampedWorld } from '@/model/world';
import { applyWorld, createRoomSync, stateRecords } from '@/sync/room';

// An in-memory stand-in for the room server in apps/landing/api/vouch, with
// the same compare-and-set rules. `down` makes every request fail.
function fakeServer(teamCode = 't') {
  let slot = { version: 0, generation: 1, world: null as unknown };
  const claims = new Map<string, string>();
  const presence = new Map<
    string,
    { browserId: string; persona: string; at: number }
  >();
  const server = {
    down: false,
    /** Refuse every write with 409, and count the attempts. */
    busy: false,
    puts: 0,
    slot: () => slot,
    fetch: (async (input: string, init?: RequestInit) => {
      if (server.down) throw new Error('offline');
      const path = new URL(input, 'http://x').pathname;
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      const reply = (status: number, value: unknown) =>
        new Response(JSON.stringify(value), { status });
      if (path === '/api/vouch/world') {
        if (init?.method !== 'PUT') return reply(200, structuredClone(slot));
        server.puts++;
        if (server.busy) return reply(409, structuredClone(slot));
        if (
          body.baseVersion !== slot.version ||
          body.generation !== slot.generation
        )
          return reply(409, structuredClone(slot));
        slot = {
          version: slot.version + 1,
          generation: slot.generation,
          world: structuredClone(body.world),
        };
        return reply(200, {
          version: slot.version,
          generation: slot.generation,
        });
      }
      if (path === '/api/vouch/world/reset') {
        if (body.teamCode !== teamCode)
          return reply(403, { error: 'wrong team code' });
        slot = {
          version: slot.version + 1,
          generation: slot.generation + 1,
          world: body.keep ?? null,
        };
        claims.clear();
        return reply(200, {
          version: slot.version,
          generation: slot.generation,
        });
      }
      if (path === '/api/vouch/claim') {
        if (!claims.has(body.token)) claims.set(body.token, body.id);
        const winner = claims.get(body.token);
        return reply(winner === body.id ? 200 : 409, { claimedBy: winner });
      }
      if (path === '/api/vouch/presence') {
        presence.set(body.browserId, { ...body, at: Date.now() });
        return reply(200, { here: [...presence.values()] });
      }
      return reply(404, {});
    }) as typeof fetch,
  };
  return server;
}

// One browser in the room, playing `persona`.
function browser(
  server: ReturnType<typeof fakeServer>,
  persona: string,
  options: { pushDelay?: number; onReset?: () => void } = {},
) {
  // oxlint-disable-next-line prefer-const -- the adapter's onCommit needs `sync` before it exists
  let sync: ReturnType<typeof createRoomSync>;
  const api = createMockAdapter(createSeed({ demo: true }), {
    delay: 0,
    shared: true,
    onCommit: () => sync.commit(),
  });
  api.setState('persona', persona);
  sync = createRoomSync({
    api,
    room: 'demo',
    fetch: server.fetch,
    pushDelay: 5,
    browserId: `browser_${persona}`,
    ...options,
  });
  return { api, sync };
}

const answer = (
  api: ReturnType<typeof createMockAdapter>,
  subject: string,
  yes = true,
) =>
  api.evaluate({
    evaluated: subject,
    positive: yes,
    confidence: 3,
    category: 'subject',
  }).done;
const has = (
  api: ReturnType<typeof createMockAdapter>,
  rater: string,
  subject: string,
) => api.state.answers.some((a) => a.rater === rater && a.subject === subject);

describe('applyWorld', () => {
  test.each([false, true])(
    'the seed survives a round trip (demo: %p)',
    (demo) => {
      const api = createMockAdapter(createSeed({ demo, now: 0 }));
      const before = stateRecords(api);
      applyWorld(api, stampedWorld(before, emptyWorld(), 'seed', 0));
      expect(stateRecords(api)).toEqual(before);
    },
  );

  test('two managers saying Yes promote a trainer', () => {
    const api = createMockAdapter(createSeed());
    const records = stateRecords(api);
    for (const rater of ['nora', 'auryn'])
      records.answers[rater] = {
        domain: 'interfold',
        subject: 'lena',
        rater,
        role: 'trainer',
        question: 0,
        yes: true,
        conf: 3,
        time: '2026-01-01T00:00:00Z',
      };
    applyWorld(api, stampedWorld(records, emptyWorld(), 'x', 1));
    expect(api.state.promotedRoles.lena?.interfold?.trainer).toBe(1);
    expect(api.getVerifications('lena').categories.trainer?.level).toBe(1);
  });

  test('player-ready comes from player Yes answers only', () => {
    const api = createMockAdapter(createSeed());
    const records = stateRecords(api);
    const add = (subject: string, role: string, yes: boolean) =>
      (records.answers[`${subject}-${role}`] = {
        domain: 'interfold',
        subject,
        rater: 'nora',
        role,
        question: 0,
        yes,
        conf: 3,
        time: '2026-01-01T00:00:00Z',
      });
    add('kenji', 'player', true);
    add('rosa', 'player', false);
    add('mateo', 'trainer', true);
    applyWorld(api, stampedWorld(records, emptyWorld(), 'x', 1));
    expect({ ...api.state.playerReady }).toEqual({ kenji: true });
  });

  test("one manager's Yes plus another manager's unrelated answer promotes no one", () => {
    const api = createMockAdapter(createSeed());
    const records = stateRecords(api);
    const base = {
      domain: 'interfold',
      question: 0,
      conf: 3,
      time: '2026-01-01T00:00:00Z',
    };
    records.answers.a = {
      ...base,
      subject: 'lena',
      rater: 'nora',
      role: 'trainer',
      yes: true,
    };
    records.answers.b = {
      ...base,
      subject: 'kenji',
      rater: 'auryn',
      role: 'subject',
      yes: true,
    };
    applyWorld(api, stampedWorld(records, emptyWorld(), 'x', 1));
    expect(api.state.promotedRoles.lena).toBeUndefined();
  });

  test('a persona missing from the world is signed out', () => {
    const api = createMockAdapter(createSeed());
    api.setState('persona', 'ghost');
    applyWorld(api, stampedWorld(stateRecords(api), emptyWorld(), 'x', 1));
    expect(api.state.persona).toBe('newcomer');
  });
});

describe('createRoomSync', () => {
  test('an answer in one browser reaches the other', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    const b = browser(server, 'kenji');
    await a.sync.poll();
    await b.sync.poll();
    await answer(a.api, 'kenji');
    await a.sync.push();
    await b.sync.poll();
    expect(has(b.api, 'philip', 'kenji')).toBe(true);
    expect(server.slot().version).toBe(1);
  });

  test('writes on the same version merge instead of overwriting', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    const b = browser(server, 'adam');
    await a.sync.poll();
    await b.sync.poll();
    await answer(a.api, 'kenji');
    await answer(b.api, 'rosa');
    await a.sync.push();
    await b.sync.push(); // refused, merged, sent again
    await a.sync.poll();
    for (const { api } of [a, b]) {
      expect(has(api, 'philip', 'kenji')).toBe(true);
      expect(has(api, 'adam', 'rosa')).toBe(true);
    }
  });

  test('a removal reaches the other browser', async () => {
    const server = fakeServer();
    const a = browser(server, 'kenji');
    const b = browser(server, 'philip');
    await a.sync.poll();
    await b.sync.poll();
    await a.api.linkAddress({ address: 'kenji-new' }).done;
    await a.sync.push();
    await b.sync.poll();
    expect(b.api.state.nodes.kenji?.map((n) => n.address)).toContain(
      'kenji-new',
    );
    await a.api.unlinkAddress().done;
    await a.sync.push();
    await b.sync.poll();
    expect(b.api.state.nodes.kenji?.map((n) => n.address)).not.toContain(
      'kenji-new',
    );
  });

  test('changes made before the room was read are still sent', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    await answer(a.api, 'kenji');
    await a.sync.poll();
    await a.sync.push();
    const b = browser(server, 'adam');
    await b.sync.poll();
    expect(has(b.api, 'philip', 'kenji')).toBe(true);
  });

  test('a reset reaches every browser and keeps only real people', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    const b = browser(server, 'kenji');
    await a.sync.poll();
    await b.sync.poll();
    await answer(a.api, 'kenji');
    await a.sync.push();
    await b.sync.poll();
    expect(await a.sync.reset('wrong')).toBe(false);
    expect(await a.sync.reset('t')).toBe(true);
    expect(has(a.api, 'philip', 'kenji')).toBe(false);
    await b.sync.poll();
    expect(has(b.api, 'philip', 'kenji')).toBe(false);
    // Kenji is practice cast, so their browser goes back to signed out; Philip is a founder and stays.
    expect(b.api.state.persona).toBe('newcomer');
    expect(a.api.state.persona).toBe('philip');
    expect(server.slot().generation).toBe(2);
  });

  test('a browser from before a reset cannot write the old world back', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    const stale = browser(server, 'adam');
    await a.sync.poll();
    await stale.sync.poll();
    await answer(stale.api, 'kenji');
    await a.sync.reset('t');
    await stale.sync.push(); // refused with a new generation: takes the reset world
    expect(has(stale.api, 'adam', 'kenji')).toBe(false);
    await stale.sync.poll();
    expect(server.slot().generation).toBe(2);
    expect(JSON.stringify(server.slot().world ?? {})).not.toContain(
      '"rater":"adam"',
    );
  });

  test('a change not yet sent survives a poll of the same generation', async () => {
    const server = fakeServer();
    let resets = 0;
    const a = browser(server, 'philip', {
      pushDelay: 60_000,
      onReset: () => resets++,
    });
    const b = browser(server, 'adam');
    await a.sync.poll();
    await b.sync.poll();
    await answer(b.api, 'rosa');
    await b.sync.push();
    await answer(a.api, 'kenji');
    await a.sync.poll();
    expect(has(a.api, 'philip', 'kenji')).toBe(true);
    expect(has(a.api, 'adam', 'rosa')).toBe(true);
    expect(resets).toBe(0);
    await a.sync.push();
    expect(JSON.stringify(server.slot().world)).toContain('"rater":"philip"');
  });

  test('a push gives up after 5 refused writes', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip', { pushDelay: 60_000 });
    await a.sync.poll();
    server.busy = true;
    await answer(a.api, 'kenji');
    server.puts = 0;
    await a.sync.push();
    expect(server.puts).toBe(5);
    server.busy = false;
    await a.sync.push();
  });

  test('a failed send shows as not synced and is retried', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    await a.sync.poll();
    server.down = true;
    await answer(a.api, 'kenji');
    await a.sync.push();
    expect(a.sync.status()).toBe('Not synced · retrying');
    server.down = false;
    await a.sync.push();
    expect(a.sync.status()).toBe('');
    expect(JSON.stringify(server.slot().world)).toContain('"rater":"philip"');
  });

  test('the first claim on an invite wins', async () => {
    const server = fakeServer();
    const a = browser(server, 'newcomer');
    const b = browser(server, 'newcomer');
    const token = 'b'.repeat(32);
    expect(await a.sync.claim(token, 'idA')).toBe(true);
    expect(await b.sync.claim(token, 'idB')).toBe(false);
  });

  test('presence lists the browsers in the room', async () => {
    const server = fakeServer();
    const a = browser(server, 'philip');
    const b = browser(server, 'adam');
    await a.sync.beat();
    await b.sync.beat();
    expect(b.sync.here().map((p) => p.persona)).toEqual(['philip', 'adam']);
  });
});
