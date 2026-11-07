import { describe, expect, test } from 'bun:test';
import { createMockAdapter } from '@/adapter/mock';
import {
  deriveHistory,
  deriveRequestBreakdown,
  deriveRequestQueue,
  deriveStatus,
  level,
} from '@/model/derive';
import { createSeed } from '@/model/seed';

const practice = (demo = false) =>
  createMockAdapter(
    createSeed({ demo, now: Date.parse('2026-10-01T00:00:00Z') }),
    { delay: 0 },
  );

describe('deriveStatus', () => {
  const api = practice();
  test('a No holds an operator back', () => {
    expect(deriveStatus(api, 'idris')).toBe('Held back by a No');
    expect(level(api, 'idris', 1)).toBe(-1);
  });
  test('two Yes answers to every question seat an operator', () => {
    expect(deriveStatus(api, 'maya')).toBe('Seated');
    expect(deriveStatus(api, 'kenji')).toBe('Seated');
  });
  test('fewer than two Yes answers leaves an operator pending', () => {
    expect(deriveStatus(api, 'sofia')).toBe('Pending');
    expect(deriveStatus(practice(true), 'kenji')).toBe('Pending');
  });
});

describe('deriveRequestQueue', () => {
  test("Auryn's queue holds the seeded operator, player and trainer asks", () => {
    const api = practice();
    const queue = deriveRequestQueue(api, 'auryn');
    expect(queue.incoming.map((r) => [r.from, r.status])).toEqual([
      ['idris', 'Disputed'],
      ['sofia', 'Pending'],
      ['leo', 'New'],
    ]);
    expect(queue.player.map((r) => r.from)).toEqual(['dara', 'viktor']);
    expect(queue.trainer.map((r) => r.from)).toEqual(['nora']);
    expect(deriveRequestBreakdown(api, 'auryn')).toMatchObject({
      Disputed: 1,
      Pending: 1,
      New: 1,
      'Player ask': 2,
      'Trainer ask': 1,
    });
  });

  test("Lena's operator asks are newest first", () => {
    const times = deriveRequestQueue(practice(), 'lena').incoming.map((r) =>
      Date.parse(r.time),
    );
    expect(times.length).toBeGreaterThan(2);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  test('Later and Ignore move a request out of the active sections', () => {
    const api = practice();
    api.requests.defer({ from: 'dara', to: 'auryn', kind: 'later' });
    api.requests.defer({ from: 'viktor', to: 'auryn', kind: 'ignored' });
    const queue = deriveRequestQueue(api, 'auryn');
    expect(queue.player).toEqual([]);
    expect(queue.later.map((r) => [r.from, r.status])).toEqual([
      ['dara', 'Later'],
    ]);
    expect(queue.ignored.map((r) => r.from)).toEqual(['viktor']);
    api.requests.restore({ from: 'dara', to: 'auryn' });
    expect(deriveRequestQueue(api, 'auryn').player.map((r) => r.from)).toEqual([
      'dara',
    ]);
  });

  test('an operator leaves the queue once every question is answered', async () => {
    const api = practice();
    api.setState('persona', 'auryn');
    for (const question of [0, 1, 2])
      await api.evaluate({
        evaluated: 'sofia',
        positive: true,
        confidence: 3,
        question,
        category: 'subject',
      }).done;
    expect(
      deriveRequestQueue(api, 'auryn').incoming.map((r) => r.from),
    ).toEqual(['idris', 'leo']);
  });
});

describe('deriveHistory', () => {
  test("lists the people someone answered, with Lena's seeded answers", () => {
    const history = deriveHistory(practice(), 'lena');
    expect(history.map((row) => row.subject).sort()).toEqual([
      'hanne',
      'maya',
      'sofia',
      'viktor',
    ]);
    expect(history[0].answers).toHaveLength(3);
  });

  test('a player answer shows as answers, not as a rated-in request', async () => {
    const api = practice();
    api.setState('persona', 'auryn');
    await api.evaluate({
      evaluated: 'dara',
      positive: true,
      confidence: 3,
      category: 'player',
    }).done;
    const row = deriveHistory(api, 'auryn').find((r) => r.subject === 'dara');
    expect(row?.answers.map((a) => a.role)).toEqual(['player']);
    expect(row?.player).toBeUndefined();
  });

  test('a request rated in elsewhere is dated by its decision', () => {
    const api = practice();
    api.setState('playerRequests', (x) => x.from === 'dara', {
      status: 'Rated in',
      decided: '2026-09-30T00:00:00Z',
    });
    const row = deriveHistory(api, 'auryn').find((r) => r.subject === 'dara');
    expect(row).toMatchObject({
      time: '2026-09-30T00:00:00Z',
      player: { from: 'dara' },
    });
  });
});

describe('role asks to the founders', () => {
  test('a trainer ask to Philip reaches his queue', async () => {
    const api = practice();
    api.setState('persona', 'nora');
    await api.requests.ask({ to: 'philip', category: 'trainer' }).done;
    expect(
      deriveRequestQueue(api, 'philip').rows.map((r) => [r.from, r.status]),
    ).toContainEqual(['nora', 'Trainer ask']);
  });

  test('a manager at level 1 sees a trainer ask; a non-manager does not', async () => {
    const api = practice();
    api.setState('persona', 'oskar');
    await api.requests.ask({ to: 'nora', category: 'trainer' }).done;
    await api.requests.ask({ to: 'lena', category: 'trainer' }).done;
    expect(
      deriveRequestQueue(api, 'nora').rows.map((r) => [r.from, r.status]),
    ).toContainEqual(['oskar', 'Trainer ask']);
    expect(
      deriveRequestQueue(api, 'lena').rows.map((r) => r.from),
    ).not.toContain('oskar');
  });
});
