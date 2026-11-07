import { describe, expect, test } from 'bun:test';
import {
  cleanWorld,
  emptyWorld,
  keepAfterReset,
  mergeWorld,
  stampedWorld,
  worldKey,
} from '@/model/world';
import type { World } from '@/model/world';

const world = (parts: Partial<World>) =>
  ({ ...emptyWorld(), ...parts }) as World;

describe('mergeWorld', () => {
  const a = world({ answers: { a: { yes: true, updatedAt: 1, by: 'a' } } });
  const b = world({
    answers: {
      a: { yes: false, updatedAt: 1, by: 'b' },
      c: { yes: true, updatedAt: 2, by: 'c' },
    },
  });

  test('is pure, commutative and idempotent', () => {
    const before = JSON.stringify([a, b]);
    expect(JSON.stringify(mergeWorld(a, b))).toBe(
      JSON.stringify(mergeWorld(b, a)),
    );
    expect(mergeWorld(a, a)).toEqual(a);
    expect(JSON.stringify([a, b])).toBe(before);
  });

  test('breaks a full tie on the greater content, in either order', () => {
    const one = world({ answers: { x: { v: 1, updatedAt: 1, by: 'a' } } });
    const two = world({ answers: { x: { v: 2, updatedAt: 1, by: 'a' } } });
    expect(mergeWorld(one, two).answers.x.v).toBe(2);
    expect(mergeWorld(two, one).answers.x.v).toBe(2);
  });

  test('picks the later stamp, then the greater author', () => {
    expect(mergeWorld(a, b).answers.a.by).toBe('b');
    const later = world({
      answers: { a: { yes: true, updatedAt: 5, by: 'a' } },
    });
    expect(mergeWorld(later, b).answers.a.updatedAt).toBe(5);
  });

  test('keeps a newer tombstone over an older record', () => {
    const removed = world({
      answers: { a: { yes: true, updatedAt: 3, by: 'a', removed: true } },
    });
    expect(mergeWorld(b, removed).answers.a.removed).toBe(true);
  });
});

describe('keepAfterReset', () => {
  const w = world({
    identities: { rowan: { name: 'Rowan', updatedAt: 1, by: 'rowan' } },
    answers: {
      real: {
        rater: 'philip',
        subject: 'rowan',
        removed: true,
        updatedAt: 1,
        by: 'x',
      },
      practice: {
        rater: 'philip',
        subject: 'kenji',
        removed: true,
        updatedAt: 1,
        by: 'x',
      },
    },
    nodes: {
      real: { owner: 'rowan', updatedAt: 1, by: 'x' },
      practice: { owner: 'rosa', updatedAt: 1, by: 'x' },
    },
  });

  test('keeps real people and drops the practice cast, without mutating', () => {
    const before = JSON.stringify(w);
    const kept = keepAfterReset(w);
    expect(JSON.stringify(w)).toBe(before);
    expect(JSON.stringify(keepAfterReset(kept))).toBe(JSON.stringify(kept));
    expect(Object.keys(kept.answers)).toEqual(['real']);
    expect(Object.keys(kept.nodes)).toEqual(['real']);
    expect(Object.keys(kept.identities)).toEqual(['rowan']);
    kept.nodes.real.owner = 'changed';
    expect(w.nodes.real.owner).toBe('rowan');
  });

  test('keeps an invite only while its inviter and claimer are real', () => {
    const invite = (claimedBy?: string) => ({
      inviter: 'philip',
      name: 'Sam',
      createdAt: 1,
      claimedBy,
      updatedAt: 1,
      by: 'x',
    });
    const kept = keepAfterReset(
      world({
        invites: {
          open: invite(),
          rowan: invite('philip'),
          kenji: invite('kenji'),
        },
      }),
    );
    expect(Object.keys(kept.invites)).toEqual(['open', 'rowan']);
  });
});

describe('cleanWorld', () => {
  const stamp = { updatedAt: 1, by: 'nora' };
  const answer = {
    rater: 'nora',
    subject: 'maya',
    domain: 'interfold',
    question: 0,
    yes: true,
    conf: 4,
    time: 't',
    ...stamp,
  };
  const token = 'a'.repeat(32);
  const invite = { inviter: 'philip', name: 'Sam', createdAt: 1, ...stamp };

  test('keeps good records and defaults an invite role', () => {
    const clean = cleanWorld({
      answers: { k: answer },
      invites: { [token]: invite },
    });
    expect(clean.answers.k).toEqual(answer);
    expect(clean.invites[token].role).toBe('operator');
  });

  test('drops malformed records', () => {
    const input = JSON.parse(
      JSON.stringify({
        answers: {
          conf: { ...answer, conf: 5 },
          unstamped: { ...answer, by: undefined },
        },
        invites: { 'not-a-token': invite },
        nodeReady: { nora: { value: 'yes', ...stamp } },
        arrivalRole: { nora: stamp },
      }),
    );
    // An own `__proto__` key, as JSON from the server would have.
    Object.assign(
      input.answers,
      JSON.parse(`{"__proto__": ${JSON.stringify(answer)}}`),
    );
    input.nameGrants = { constructor: { viewer: 'a', person: 'b', ...stamp } };
    const clean = cleanWorld(input);
    expect(clean.answers).toEqual({});
    expect(clean.invites).toEqual({});
    expect(clean.nodeReady).toEqual({});
    expect(clean.arrivalRole).toEqual({});
    expect(clean.nameGrants).toEqual({});
  });

  test('checks names, addresses and confidence at their limits', () => {
    const node = (address: string) => ({
      owner: 'rosa',
      id: address,
      address,
      location: 'l',
      added: 't',
      ...stamp,
    });
    const clean = cleanWorld({
      answers: { one: { ...answer, conf: 1 } },
      invites: {
        ['b'.repeat(32)]: { ...invite, name: 'x'.repeat(80) },
        ['c'.repeat(32)]: { ...invite, name: 'x'.repeat(81) },
        ['d'.repeat(32)]: { ...invite, name: '  ' },
      },
      nodes: {
        [worldKey('rosa', 'a'.repeat(200))]: node('a'.repeat(200)),
        [worldKey('rosa', 'a'.repeat(201))]: node('a'.repeat(201)),
      },
    });
    expect(Object.keys(clean.answers)).toEqual(['one']);
    expect(Object.keys(clean.invites)).toEqual(['b'.repeat(32)]);
    expect(Object.keys(clean.nodes)).toEqual([
      worldKey('rosa', 'a'.repeat(200)),
    ]);
  });

  test('drops a node whose key does not match it', () => {
    const node = {
      owner: 'rosa',
      id: 'n1',
      address: 'a',
      location: 'l',
      added: 't',
      ...stamp,
    };
    expect(
      cleanWorld({ nodes: { [worldKey('rosa', 'n1')]: node, other: node } })
        .nodes,
    ).toEqual({
      [worldKey('rosa', 'n1')]: node,
    });
  });

  test('returns an empty world for anything but a plain object', () => {
    expect(cleanWorld([1])).toEqual(emptyWorld());
    expect(cleanWorld(null)).toEqual(emptyWorld());
  });
});

describe('stampedWorld', () => {
  test('stamps changed records only, and tombstones removed ones', () => {
    const previous = world({
      answers: {
        same: { yes: true, updatedAt: 1, by: 'a' },
        changed: { yes: true, updatedAt: 1, by: 'a' },
        gone: { yes: true, updatedAt: 1, by: 'a' },
      },
    });
    const records = {
      ...emptyWorld(),
      answers: {
        same: { yes: true },
        changed: { yes: false },
        added: { yes: true },
      },
    };
    const next = stampedWorld(records, previous, 'nora', 9);
    expect(next.answers.same).toEqual({ yes: true, updatedAt: 1, by: 'a' });
    expect(next.answers.changed).toEqual({
      yes: false,
      updatedAt: 9,
      by: 'nora',
    });
    expect(next.answers.added).toEqual({ yes: true, updatedAt: 9, by: 'nora' });
    expect(next.answers.gone).toEqual({
      yes: true,
      removed: true,
      updatedAt: 9,
      by: 'nora',
    });
  });

  test('leaves the previous world unchanged', () => {
    const previous = world({
      answers: { a: { yes: true, updatedAt: 1, by: 'a' } },
    });
    const before = JSON.stringify(previous);
    stampedWorld(
      { ...emptyWorld(), answers: { b: { yes: true } } },
      previous,
      'nora',
      9,
    );
    expect(JSON.stringify(previous)).toBe(before);
  });

  test('revives a removed record, and leaves a tombstone alone', () => {
    const previous = world({
      answers: {
        back: { yes: true, removed: true, updatedAt: 1, by: 'a' },
        dead: { yes: true, removed: true, updatedAt: 1, by: 'a' },
      },
    });
    const next = stampedWorld(
      { ...emptyWorld(), answers: { back: { yes: true } } },
      previous,
      'nora',
      9,
    );
    expect(next.answers.back).toEqual({ yes: true, updatedAt: 9, by: 'nora' });
    expect(next.answers.dead).toEqual(previous.answers.dead);
  });
});
