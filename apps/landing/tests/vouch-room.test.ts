import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

// The room endpoints against a real Postgres. They run only when
// VOUCH_TEST_DATABASE_URL names a disposable database (it must accept TLS),
// and only alone, because the database client is shared across test files:
//   VOUCH_TEST_DATABASE_URL=postgres://... bun test tests/vouch-room.test.ts
// The tables are emptied first, so never point it at a real database.
const url = process.env.VOUCH_TEST_DATABASE_URL;

describe.skipIf(!url)('vouch rooms', async () => {
  if (!url) return;
  process.env.DATABASE_URL = url;
  process.env.VOUCH_TEAM_CODE = 't';
  const { sql } = await import('../api/lib/db');
  const { ensureSchema } = await import('../api/lib/ensure-schema');
  const world = (await import('../api/vouch/world')).default;
  const reset = (await import('../api/vouch/world/reset')).default;
  const presence = (await import('../api/vouch/presence')).default;
  const claim = (await import('../api/vouch/claim')).default;

  beforeAll(async () => {
    await ensureSchema();
    await sql`TRUNCATE vouch_rooms, vouch_presence, vouch_claims`;
  });
  afterAll(() => sql.end());

  type Handler = typeof world;
  const call = async (
    handler: Handler,
    method: string,
    room: string,
    body?: unknown,
  ) => {
    let status = 0;
    let out: unknown;
    const res = {
      status(s: number) {
        status = s;
        return res;
      },
      json(j: unknown) {
        out = j;
        return res;
      },
      end() {
        return res;
      },
      setHeader() {},
      headersSent: false,
    };
    // oxlint-disable-next-line typescript/no-explicit-any -- a minimal stand-in for Vercel's req and res
    await handler({ method, query: { room }, body } as any, res as any);
    return [status, out] as const;
  };

  test('writes are compare-and-set on the version', async () => {
    expect(await call(world, 'GET', 'demo-1')).toEqual([
      200,
      { version: 0, generation: 1, world: null },
    ]);
    expect(
      await call(world, 'PUT', 'demo-1', {
        baseVersion: 0,
        generation: 1,
        world: { a: 1 },
      }),
    ).toEqual([200, { version: 1, generation: 1 }]);
    expect(
      await call(world, 'PUT', 'demo-1', {
        baseVersion: 0,
        generation: 1,
        world: { b: 1 },
      }),
    ).toEqual([409, { version: 1, generation: 1, world: { a: 1 } }]);
    expect(
      await call(world, 'PUT', 'demo-1', {
        baseVersion: 1,
        generation: 1,
        world: { a: 1, b: 1 },
      }),
    ).toEqual([200, { version: 2, generation: 1 }]);
  });

  test('two writes on the same version: exactly one wins', async () => {
    const room = 'race-1';
    const results = await Promise.all(
      [1, 2, 3, 4].map((n) =>
        call(world, 'PUT', room, {
          baseVersion: 0,
          generation: 1,
          world: { n },
        }),
      ),
    );
    expect(results.filter(([s]) => s === 200)).toHaveLength(1);
    expect(results.filter(([s]) => s === 409)).toHaveLength(3);
  });

  test('a world keeps its key order', async () => {
    const stored = { z: { b: 1, a: 2 }, answers: {} };
    await call(world, 'PUT', 'order-1', {
      baseVersion: 0,
      generation: 1,
      world: stored,
    });
    const [, body] = await call(world, 'GET', 'order-1');
    expect(JSON.stringify((body as { world: unknown }).world)).toBe(
      JSON.stringify(stored),
    );
  });

  test('bad requests are refused', async () => {
    expect((await call(world, 'GET', 'Bad Room'))[0]).toBe(400);
    expect(
      (await call(world, 'PUT', 'demo-1', { baseVersion: 2, world: {} }))[0],
    ).toBe(400);
    expect(
      (
        await call(world, 'PUT', 'demo-1', {
          baseVersion: 2,
          generation: 1,
          world: null,
        })
      )[0],
    ).toBe(400);
    expect(
      (
        await call(world, 'PUT', 'demo-1', {
          baseVersion: 2,
          generation: 1,
          world: { answers: null },
        })
      )[0],
    ).toBe(400);
    expect(
      (
        await call(world, 'PUT', 'demo-1', {
          baseVersion: 2,
          generation: 1,
          world: { answers: { k: 'x'.repeat(400000) } },
        })
      )[0],
    ).toBe(413);
    expect((await call(world, 'DELETE', 'demo-1'))[0]).toBe(405);
    // The largest value the columns hold is still a valid version: a conflict, not a refusal.
    expect(
      (
        await call(world, 'PUT', 'demo-1', {
          baseVersion: 2 ** 31 - 1,
          generation: 2 ** 31 - 1,
          world: {},
        })
      )[0],
    ).toBe(409);
    for (const [baseVersion, generation] of [
      [2 ** 31, 1],
      [0, 1e10],
      [-1, 1],
      [1.5, 1],
      ['1', 1],
      [null, 1],
    ])
      expect(
        (
          await call(world, 'PUT', 'demo-1', {
            baseVersion,
            generation,
            world: {},
          })
        )[0],
      ).toBe(400);
  });

  test('a world of exactly the size limit is stored; one more character is refused', async () => {
    const sized = (n: number) => ({ answers: { k: 'x'.repeat(n) } });
    const overhead = JSON.stringify(sized(0)).length;
    expect(
      (
        await call(world, 'PUT', 'size-1', {
          baseVersion: 0,
          generation: 1,
          world: sized(300_000 - overhead),
        })
      )[0],
    ).toBe(200);
    expect(
      (
        await call(world, 'PUT', 'size-1', {
          baseVersion: 1,
          generation: 1,
          world: sized(300_001 - overhead),
        })
      )[0],
    ).toBe(413);
  });

  test('rooms unused for 14 days are deleted on the next write', async () => {
    await call(world, 'PUT', 'old-1', {
      baseVersion: 0,
      generation: 1,
      world: {},
    });
    await call(claim, 'POST', 'old-1', {
      token: 'c'.repeat(32),
      id: 'someone',
    });
    await sql`UPDATE vouch_rooms SET updated_at = now() - interval '15 days' WHERE room = 'old-1'`;
    await sql`UPDATE vouch_claims SET created_at = now() - interval '15 days' WHERE room = 'old-1'`;
    await call(world, 'PUT', 'new-1', {
      baseVersion: 0,
      generation: 1,
      world: {},
    });
    expect((await call(world, 'GET', 'old-1'))[1]).toEqual({
      version: 0,
      generation: 1,
      world: null,
    });
    expect(
      await call(claim, 'POST', 'old-1', {
        token: 'c'.repeat(32),
        id: 'other',
      }),
    ).toEqual([200, { claimedBy: 'other' }]);
  });

  test('a reset needs the team code and refuses the old generation', async () => {
    expect((await call(reset, 'POST', 'demo-1', { teamCode: 'x' }))[0]).toBe(
      403,
    );
    expect(await call(reset, 'POST', 'demo-1', { teamCode: 't' })).toEqual([
      200,
      { version: 3, generation: 2 },
    ]);
    expect(
      await call(world, 'PUT', 'demo-1', {
        baseVersion: 3,
        generation: 1,
        world: { old: 1 },
      }),
    ).toEqual([409, { version: 3, generation: 2, world: null }]);
    expect(
      await call(world, 'PUT', 'demo-1', {
        baseVersion: 3,
        generation: 2,
        world: { c: 1 },
      }),
    ).toEqual([200, { version: 4, generation: 2 }]);
  });

  test('a reset can keep part of the world', async () => {
    expect(
      await call(reset, 'POST', 'demo-2', {
        teamCode: 't',
        keep: { identities: { abc: { name: 'Rowan' } } },
      }),
    ).toEqual([200, { version: 1, generation: 2 }]);
    expect((await call(world, 'GET', 'demo-2'))[1]).toEqual({
      version: 1,
      generation: 2,
      world: { identities: { abc: { name: 'Rowan' } } },
    });
    expect(
      (
        await call(reset, 'POST', 'demo-2', {
          teamCode: 't',
          keep: { answers: null },
        })
      )[0],
    ).toBe(400);
  });

  test('presence lists the browsers in the room', async () => {
    const [status, body] = await call(presence, 'POST', 'demo-1', {
      browserId: 'browserA1',
      persona: 'auryn',
    });
    expect(status).toBe(200);
    expect(
      (body as { here: { persona: string }[] }).here.map((p) => p.persona),
    ).toEqual(['auryn']);
    await call(presence, 'POST', 'demo-1', {
      browserId: 'browserA1',
      persona: 'philip',
    });
    const [, after] = await call(presence, 'GET', 'demo-1');
    expect(
      (after as { here: { persona: string }[] }).here.map((p) => p.persona),
    ).toEqual(['philip']);
    expect(
      (
        await call(presence, 'POST', 'demo-1', {
          browserId: 'x',
          persona: 'auryn',
        })
      )[0],
    ).toBe(400);
    for (const [persona, status] of [
      ['p'.repeat(80), 200],
      ['p'.repeat(81), 400],
    ] as const)
      expect(
        (
          await call(presence, 'POST', 'demo-1', {
            browserId: 'browserB1',
            persona,
          })
        )[0],
      ).toBe(status);
  });

  test('the first claim on an invite wins, until a reset', async () => {
    const token = 'a'.repeat(32);
    expect(
      await call(claim, 'POST', 'demo-1', { token, id: 'newcomerA' }),
    ).toEqual([200, { claimedBy: 'newcomerA' }]);
    expect(
      await call(claim, 'POST', 'demo-1', { token, id: 'newcomerB' }),
    ).toEqual([409, { claimedBy: 'newcomerA' }]);
    expect(
      (await call(claim, 'POST', 'demo-1', { token: '<x>', id: 'a' }))[0],
    ).toBe(400);
    await call(reset, 'POST', 'demo-1', { teamCode: 't' });
    expect(
      await call(claim, 'POST', 'demo-1', { token, id: 'newcomerB' }),
    ).toEqual([200, { claimedBy: 'newcomerB' }]);
  });
});
