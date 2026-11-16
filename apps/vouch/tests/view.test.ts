import { describe, expect, test } from 'bun:test';
import { createMockAdapter } from '@/adapter/mock';
import { deriveRequestQueue } from '@/model/derive';
import { createSeed } from '@/model/seed';
import {
  ago,
  answeredAll,
  askName,
  askStatus,
  canRate,
  confidenceFromHold,
  homeCard,
  isOperator,
  label,
  nextIncoming,
  operatorAsked,
  operatorNo,
  partnerAnswer,
  requestKinds,
  roleChips,
  sentAsks,
  stateClass,
  topRole,
} from '@/model/view';

// Expected values are what the standalone vouch-app (github.com/BrightID/vouch-app)
// shows for the same seed, checked by hand when each test was written.

const practice = (demo = false, persona = 'newcomer') => {
  const api = createMockAdapter(
    createSeed({ demo, now: Date.parse('2026-10-01T00:00:00Z') }),
    { delay: 0 },
  );
  api.setState('persona', persona);
  return api;
};

test('confidenceFromHold steps up at 300, 700 and 1200 ms', () => {
  expect(
    [0, 299, 300, 699, 700, 1199, 1200, 5000].map(confidenceFromHold),
  ).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
});

test('ago rounds down to the largest unit', () => {
  const now = Date.parse('2026-10-01T00:00:00Z');
  const before = (minutes: number) =>
    ago(new Date(now - minutes * 60000).toISOString(), now);
  expect(ago(undefined, now)).toBe('Time not recorded');
  expect([0.5, 5, 125, 3 * 1440, 2 * 43200, 525600].map(before)).toEqual([
    'just now',
    '5m',
    '2h',
    '3d',
    '2M',
    '1Y',
  ]);
});

test('stateClass colours status words', () => {
  expect(stateClass('Seated')).toBe('good');
  expect(stateClass('Disputed')).toBe('bad');
  expect(stateClass('Player ask')).toBe('pending');
  expect(stateClass('Not verified unique')).toBe('dim');
  expect(stateClass('New')).toBe('');
});

describe('label', () => {
  test('a granted or findable name shows; anyone else shows their key', () => {
    const api = practice(false, 'nora');
    expect(label(api, 'lena')).toBe('Lena');
    expect(label(api, 'tomas')).toBe('Tomas');
    expect(label(api, 'jonas')).toBe('Jonas');
    expect(label(api, 'kenji')).toBe('ZnSXeCFD…');
  });
  test('a players-only name is hidden from someone who is not a player', () => {
    expect(label(practice(false, 'viktor'), 'jonas')).toBe('UN342DMf…');
  });
});

test('homeCard picks the status card for each practice persona', () => {
  const api = practice();
  expect(
    ['idris', 'maya', 'sofia', 'kenji', 'auryn', 'lena', 'philip'].map((p) =>
      homeCard(api, p),
    ),
  ).toEqual([
    'held-back',
    'all-set',
    'get-endorsed',
    'all-set',
    'get-endorsed',
    'choose-role',
    null,
  ]);
  // practice(true) is the seed a shared room starts from. There Kenji has no
  // endorsements yet and has sent two asks.
  expect(homeCard(practice(true), 'kenji')).toBe('waiting');
  expect(sentAsks(practice(true), 'kenji').open.map((x) => x.answered)).toEqual(
    ['Waiting', 'Waiting'],
  );
});

test("operatorNo names Priya's standing No on Idris", () => {
  expect(operatorNo(practice(), 'idris')).toMatchObject({
    r: 'priya',
    yes: false,
    question: 'Self-custody',
  });
  expect(partnerAnswer(practice(), 'idris', 1)).toBe('No');
  expect(partnerAnswer(practice(), 'maya', 0)).toBe('Yes');
  expect(partnerAnswer(practice(), 'sofia', 0)).toBe('Not decided yet');
});

test('roleChips list each role with its state', () => {
  const api = practice();
  expect(roleChips(api, 'auryn').items).toEqual([
    { role: 'operator', state: 'getting endorsed' },
    { role: 'player' },
    { role: 'trainer' },
    { role: 'manager' },
  ]);
  expect(roleChips(api, 'idris').items).toEqual([
    { role: 'operator', state: 'held back' },
  ]);
  expect(roleChips(api, 'ingrid').items).toEqual([
    { role: 'subject', level: 1 },
    { role: 'player' },
    { role: 'trainer' },
  ]);
});

test("requestKinds and nextIncoming read Auryn's queue", () => {
  const api = practice();
  expect(requestKinds(deriveRequestQueue(api, 'auryn').rows)).toEqual({
    player: 2,
    trainer: 1,
    manager: 0,
    operator: 3,
  });
  expect(nextIncoming(api, 'auryn', 'idris')?.from).toBe('sofia');
});

test('topRole and canRate', () => {
  const api = practice();
  expect(
    ['philip', 'nora', 'lena', 'idris', 'mira', 'dara'].map((id) =>
      topRole(api, id),
    ),
  ).toEqual([
    'Manager',
    'Manager',
    'Player',
    'Node operator',
    'Node operator',
    'Player',
  ]);
  expect(canRate(api, 'lena', 'question')).toBe(true);
  expect(canRate(api, 'idris', 'question')).toBe(false);
  expect(canRate(api, 'auryn', 'player')).toBe(true);
  expect(canRate(api, 'lena', 'trainer')).toBe(false);
});

describe('edges the seed tests miss', () => {
  const at = '2026-09-30T00:00:00Z';

  test('ago turns over at exactly 1 minute and 1 hour', () => {
    const now = Date.parse('2026-10-01T00:00:00Z');
    const before = (minutes: number) =>
      ago(new Date(now - minutes * 60000).toISOString(), now);
    expect([1, 60].map(before)).toEqual(['1m', '1h']);
  });

  test('a founder may rate players without a trainer level; so may a level 1 trainer', () => {
    const api = practice();
    expect(canRate(api, 'philip', 'player')).toBe(true);
    expect(canRate(api, 'tomas', 'player')).toBe(true);
  });

  test('a findable name shows to someone who is not a player', () => {
    expect(label(practice(false, 'viktor'), 'dara')).toBe('Dara');
  });

  test('exactly 2 Yes on each question seats an operator and reads Yes to Interfold', () => {
    const api = practice();
    expect(roleChips(api, 'viktor').items[0]).toEqual({
      role: 'operator',
      state: 'seated',
    });
    expect(partnerAnswer(api, 'viktor', 0)).toBe('Yes');
  });

  // No screen in this app writes the records the next three tests set: an ask
  // with no `kind`, an arrivalRole, a trainer ask. Other browsers in a room can
  // write them, so the tests set them directly.
  test('an ask with no kind is an endorsement ask, and makes its sender an operator', () => {
    const api = practice();
    api.setState('outgoing', (list) => [
      ...list,
      { from: 'zed', to: 'philip', domain: 'interfold', time: at },
    ]);
    expect(operatorAsked(api, 'zed')).toHaveLength(1);
    expect(isOperator(api, 'zed')).toBe(true);
  });

  test('someone who arrived as a player shows a player chip, getting endorsed', () => {
    const api = practice();
    api.setState('arrivalRole', 'zed', 'player');
    expect(roleChips(api, 'zed').items).toEqual([
      { role: 'player', state: 'getting endorsed' },
    ]);
  });

  test('an open trainer ask is not shown to someone already a trainer', () => {
    const api = practice();
    api.setState('playerRequests', (list) => [
      ...list,
      {
        from: 'tomas',
        to: 'philip',
        domain: 'interfold',
        role: 'trainer',
        time: at,
        status: 'waiting',
      },
    ]);
    expect(roleChips(api, 'tomas').openAsk).toBeUndefined();
  });

  test("Kenji's asks: a founder is named, and 2 of 3 answers is still Waiting", async () => {
    const api = practice(true, 'kenji');
    expect(askName(api, { from: 'kenji', to: 'philip' })).toBe('Philip');
    api.setState('persona', 'philip');
    for (const question of [0, 1])
      await api.evaluate({
        evaluated: 'kenji',
        category: 'subject',
        question,
        positive: true,
        confidence: 3,
      }).done;
    expect(askStatus(api, 'kenji', 'philip')).toBe('Waiting');
    expect(answeredAll(api, 'philip', 'kenji')).toBe(false);
    await api.evaluate({
      evaluated: 'kenji',
      category: 'subject',
      question: 2,
      positive: true,
      confidence: 3,
    }).done;
    expect(askStatus(api, 'kenji', 'philip')).toBe('Yes');
    expect(answeredAll(api, 'philip', 'kenji')).toBe(true);
  });
});
