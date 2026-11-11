import { describe, expect, spyOn, test } from 'bun:test';
import { createMockAdapter } from '@/adapter/mock';
import { op } from '@/model/derive';
import { Q } from '@/model/questions';
import { createSeed } from '@/model/seed';

const adapter = (persona: string, shared = false) => {
  const api = createMockAdapter(createSeed(), { delay: 0, shared });
  api.setState('persona', persona);
  return api;
};
const inbound = (
  api: ReturnType<typeof adapter>,
  subject: string,
  rater: string,
) =>
  api.getConnections(subject, 'inbound').find((row) => row.id === rater)
    ?.evaluations ?? [];

describe('createMockAdapter', () => {
  test('an undone answer is never applied', async () => {
    const api = adapter('auryn');
    const op = api.evaluate({
      evaluated: 'kenji',
      positive: true,
      confidence: 3,
      category: 'subject',
    });
    expect(op.undo()).toBe(true);
    expect(await op.done).toBe('failed');
    expect(op.undo()).toBe(false);
    expect(inbound(api, 'kenji', 'auryn')).toEqual([]);
  });

  test('an answer is applied and shows as an inbound connection', async () => {
    const api = adapter('auryn');
    const op = api.evaluate({
      evaluated: 'kenji',
      positive: false,
      confidence: 2,
      question: 1,
      category: 'subject',
    });
    expect(op.status).toBe('holding');
    expect(await op.done).toBe('applied');
    expect(inbound(api, 'kenji', 'auryn')).toMatchObject([
      {
        domain: 'interfold',
        category: 'subject',
        question: 'Self-custody',
        positive: false,
        confidence: 2,
      },
    ]);
  });

  for (const shared of [false, true])
    test(`a second answer replaces the first and is marked edited (shared: ${shared})`, async () => {
      const api = adapter('auryn', shared);
      await api.evaluate({
        evaluated: 'kenji',
        positive: true,
        confidence: 1,
        category: 'subject',
      }).done;
      await api.evaluate({
        evaluated: 'kenji',
        positive: false,
        confidence: 4,
        category: 'subject',
      }).done;
      expect(inbound(api, 'kenji', 'auryn')).toMatchObject([
        { positive: false, confidence: 4, edited: true },
      ]);
    });

  test("a player Yes rates in the subject's waiting request", async () => {
    const api = adapter('auryn');
    await api.evaluate({
      evaluated: 'dara',
      positive: true,
      confidence: 3,
      category: 'player',
    }).done;
    expect(
      api.state.playerRequests.find((x) => x.from === 'dara'),
    ).toMatchObject({
      status: 'Rated in',
      conf: 3,
      decided: expect.any(String),
    });
    expect(api.state.playerReady.dara).toBe(true);
  });

  test('two managers saying Yes promote a trainer', async () => {
    const api = adapter('nora');
    await api.evaluate({
      evaluated: 'lena',
      positive: true,
      confidence: 3,
      category: 'trainer',
    }).done;
    expect(api.getVerifications('lena').categories.trainer).toBeUndefined();
    api.setState('persona', 'auryn');
    await api.evaluate({
      evaluated: 'lena',
      positive: true,
      confidence: 3,
      category: 'trainer',
    }).done;
    expect(api.getVerifications('lena').categories.trainer?.level).toBe(1);
  });

  test("a non-manager's Yes does not count toward a promotion", async () => {
    const api = adapter('nora');
    await api.evaluate({
      evaluated: 'oskar',
      positive: true,
      confidence: 3,
      category: 'trainer',
    }).done;
    api.setState('persona', 'lena');
    await api.evaluate({
      evaluated: 'oskar',
      positive: true,
      confidence: 3,
      category: 'trainer',
    }).done;
    expect(api.requests.roleProgress('oskar', 'trainer').yes).toBe(1);
    expect(api.getVerifications('oskar').categories.trainer).toBeUndefined();
  });

  test('a trainer ask decided by a non-manager is not admitted by a manager', async () => {
    const api = adapter('oskar');
    await api.requests.ask({ to: 'lena', category: 'trainer' }).done;
    api.setState('persona', 'lena');
    await api.evaluate({
      evaluated: 'oskar',
      positive: true,
      confidence: 2,
      category: 'trainer',
    }).done;
    expect(
      api.state.playerRequests.find((x) => x.from === 'oskar'),
    ).toMatchObject({ status: 'Rated in', admittedByManager: false });
  });

  test('a connection carries the time of the latest answer', async () => {
    const api = adapter('auryn');
    await api.evaluate({
      evaluated: 'kenji',
      positive: true,
      confidence: 3,
      question: 0,
      category: 'subject',
    }).done;
    await Bun.sleep(2);
    await api.evaluate({
      evaluated: 'kenji',
      positive: true,
      confidence: 3,
      question: 1,
      category: 'subject',
    }).done;
    const latest = api.state.answers.at(-1)!.time;
    expect(
      api.getConnections('kenji', 'inbound').find((row) => row.id === 'auryn')
        ?.timestamp,
    ).toBe(latest);
  });

  test('an edit in a shared room keeps the answer in place', async () => {
    const api = adapter('lena', true);
    const first = api.state.answers[0];
    expect(first).toMatchObject({
      rater: 'lena',
      subject: 'maya',
      question: 0,
    });
    await api.evaluate({
      evaluated: 'maya',
      positive: true,
      confidence: 1,
      question: 0,
      category: 'subject',
    }).done;
    expect(api.state.answers[0]).toMatchObject({
      rater: 'lena',
      subject: 'maya',
      question: 0,
      conf: 1,
      edited: true,
    });
  });

  test('connecting lets the other person see your name', async () => {
    const api = adapter('kenji');
    await api.connect({ to: 'nora' }).done;
    expect(api.state.nameGrants).toContainEqual({
      viewer: 'nora',
      person: 'kenji',
    });
  });

  test('a team ask is listed as a request to the team', async () => {
    const api = adapter('kenji');
    await api.requests.ask({ to: 'team', category: 'team' }).done;
    expect(api.requests.list()).toContainEqual(
      expect.objectContaining({ from: 'kenji', to: 'team', category: 'team' }),
    );
  });

  test('a failed ask ends failed and records nothing', async () => {
    const api = adapter('kenji');
    api.setState('failNextSend', true);
    const before = api.state.outgoing.length;
    const op = api.requests.ask({ to: 'nora', category: 'endorsement' });
    expect(await op.done).toBe('failed');
    expect(api.state.outgoing.length).toBe(before);
    expect(
      await api.requests.ask({ to: 'nora', category: 'endorsement' }).done,
    ).toBe('applied');
    expect(api.state.outgoing.length).toBe(before + 1);
  });

  test('linking and unlinking an address adds and removes the node', async () => {
    const api = adapter('nora');
    await api.linkAddress({ address: 'nora-node' }).done;
    expect(api.disclosure.get('nora').nodes.map((n) => n.address)).toEqual([
      'nora-node',
    ]);
    expect(op(api, 'nora')).not.toBeNull();
    await api.unlinkAddress().done;
    expect(api.disclosure.get('nora').nodes).toEqual([]);
    expect(op(api, 'nora')).toBeNull();
  });
  test('a repeated ask replaces the earlier one', async () => {
    const api = adapter('oskar');
    await api.requests.ask({ to: 'nora', category: 'trainer' }).done;
    await api.requests.ask({ to: 'nora', category: 'trainer' }).done;
    await api.requests.ask({ to: 'nora', category: 'endorsement' }).done;
    await api.requests.ask({ to: 'nora', category: 'endorsement' }).done;
    expect(
      api.state.playerRequests.filter((x) => x.from === 'oskar'),
    ).toHaveLength(1);
    expect(api.state.outgoing.filter((x) => x.from === 'oskar')).toHaveLength(
      1,
    );
    expect(
      api.state.nameGrants.filter(
        (x) => x.viewer === 'nora' && x.person === 'oskar',
      ),
    ).toHaveLength(1);
  });

  test('rating a new ask after a declined one resolves the new ask', async () => {
    const api = adapter('dara');
    const rate = async (positive: boolean) => {
      api.setState('persona', 'auryn');
      await api.evaluate({
        evaluated: 'dara',
        positive,
        confidence: 3,
        category: 'player',
      }).done;
    };
    await rate(false);
    api.setState('persona', 'dara');
    await api.requests.ask({ to: 'auryn', category: 'player' }).done;
    await rate(true);
    expect(
      api.state.playerRequests
        .filter((x) => x.from === 'dara')
        .map((x) => x.status),
    ).toEqual(['Rated in']);
  });

  test("a player's role progress includes asks with no role", () => {
    expect(
      adapter('dara')
        .requests.roleProgress('dara', 'player')
        .requests.map((x) => x.from),
    ).toEqual(['dara']);
  });

  test('someone rated in as a player is a player even with seeded levels', async () => {
    const api = createMockAdapter(createSeed({ demo: true }), { delay: 0 });
    api.setState('persona', 'auryn');
    await api.evaluate({
      evaluated: 'rosa',
      positive: true,
      confidence: 3,
      category: 'player',
    }).done;
    expect(api.getVerifications('rosa').categories).toMatchObject({
      player: { level: 1 },
      subject: { level: 2 },
    });
  });

  test('a failing room sync does not mark an applied write failed', async () => {
    const api = createMockAdapter(createSeed(), {
      delay: 0,
      onCommit: () => {
        throw new Error('sync failed');
      },
    });
    api.setState('persona', 'kenji');
    const logged = spyOn(console, 'error').mockImplementation(() => {});
    const write = api.connect({ to: 'nora' });
    expect(await write.done).toBe('applied');
    expect(write.error).toBeUndefined();
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });

  test('changing shared control runs the room sync', () => {
    let commits = 0;
    const api = createMockAdapter(createSeed(), {
      delay: 0,
      onCommit: () => commits++,
    });
    api.disclosure.setRelationships('idris', ['viktor']);
    expect(api.disclosure.get('idris').controlRelationships).toEqual([
      'viktor',
    ]);
    expect(commits).toBe(1);
  });

  test('a trainer ask decided by a manager is admitted by a manager', async () => {
    const api = adapter('oskar');
    await api.requests.ask({ to: 'nora', category: 'trainer' }).done;
    api.setState('persona', 'nora');
    await api.evaluate({
      evaluated: 'oskar',
      positive: true,
      confidence: 3,
      category: 'trainer',
    }).done;
    expect(
      api.state.playerRequests.find((x) => x.from === 'oskar'),
    ).toMatchObject({ status: 'Rated in', admittedByManager: true });
  });

  test("each question's category reports its votes and level", () => {
    const answer = adapter('auryn').getVerifications('maya').categories[Q[0]];
    expect(answer.level).toBe(2);
    expect(answer.impacts.length).toBeGreaterThan(2);
  });
});
