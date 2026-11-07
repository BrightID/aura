// The shared practice world: every part is a map of records, each stamped with
// `updatedAt` and `by`. Browsers in a room merge their worlds record by record.
// Ported from the standalone vouch-app (BrightID/vouch-app). Keep the record shapes and keys as they
// are: rooms store worlds in this format, and a change makes browsers drop or
// misread each other's records.

export const WORLD_PARTS = [
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
] as const;

/** Parts keyed by persona, each record `{ value }`. */
export const PERSON_PARTS = [
  'nodesComplete',
  'sharedControlAnswered',
  'arrivalRole',
  'teamAsked',
  'nodeAnswered',
  'nodeAddress',
  'nodeReady',
  'nameVisibility',
] as const;

export type Part = (typeof WORLD_PARTS)[number];
// oxlint-disable-next-line typescript/no-explicit-any -- records are checked by cleanWorld, not by type
export type WorldRecord = Record<string, any>;
export type StampedRecord = WorldRecord & {
  updatedAt: number;
  by: string;
  removed?: boolean;
};
export type World = Record<Part, Record<string, StampedRecord>>;
export type Records = Record<Part, Record<string, WorldRecord>>;

export const worldKey = (...parts: unknown[]) => JSON.stringify(parts);

// How each part keys its records: identities by person id, arrivalCodes by
// code, invites by token, and each part in PERSON_PARTS by persona. The parts
// in `recordKey` build their keys from the record's own fields.
export const recordKey = {
  answers: (x: WorldRecord) =>
    worldKey(
      x.rater,
      x.subject,
      x.domain,
      x.role || 'subject',
      x.question || 0,
    ),
  outgoing: (x: WorldRecord) =>
    worldKey(x.from, x.to, x.domain, x.kind || 'endorsement'),
  playerRequests: (x: WorldRecord) =>
    worldKey(x.from, x.to, x.domain, x.role || 'player'),
  nodes: (x: WorldRecord) => worldKey(x.owner, x.id),
  nameGrants: (x: WorldRecord) => worldKey(x.viewer, x.person),
};

export const emptyWorld = <T = StampedRecord>() =>
  Object.fromEntries(WORLD_PARTS.map((part) => [part, {}])) as Record<
    Part,
    Record<string, T>
  >;

const sortedUnion = (a: object | undefined, b: object | undefined) =>
  [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].sort();

/**
 * Merge two worlds record by record. The later `updatedAt` wins, then the
 * greater `by`, then the greater JSON, so every browser picks the same record.
 * Pure, commutative and idempotent.
 */
export function mergeWorld(
  a: Partial<World> | undefined,
  b: Partial<World> | undefined,
): World {
  const result = {} as World;
  for (const part of sortedUnion(a, b) as Part[]) {
    result[part] = {};
    for (const key of sortedUnion(a?.[part], b?.[part])) {
      const left = a?.[part]?.[key];
      const right = b?.[part]?.[key];
      if (!left || !right) {
        result[part][key] = (left || right)!;
        continue;
      }
      const l = [
        Number(left.updatedAt || 0),
        String(left.by || ''),
        JSON.stringify(left),
      ] as const;
      const r = [
        Number(right.updatedAt || 0),
        String(right.by || ''),
        JSON.stringify(right),
      ] as const;
      result[part][key] =
        l[0] !== r[0]
          ? l[0] > r[0]
            ? left
            : right
          : l[1] !== r[1]
            ? l[1] > r[1]
              ? left
              : right
            : l[2] >= r[2]
              ? left
              : right;
    }
  }
  return result;
}

/** The records a room reset keeps: those naming only the founders and created people. */
export function keepAfterReset(source: Partial<World> | undefined): World {
  const real = new Set([
    'philip',
    'adam',
    'auryn',
    ...Object.keys(source?.identities || {}),
  ]);
  const people: Partial<Record<Part, (x: WorldRecord) => string[]>> = {
    answers: (x) => [x.rater, x.subject],
    outgoing: (x) => [x.from, x.to],
    playerRequests: (x) => [x.from, x.to],
    invites: (x) => [
      x.inviter,
      ...(x.claimedBy !== undefined ? [x.claimedBy] : []),
    ],
    nodes: (x) => [x.owner],
    nameGrants: (x) => [x.viewer, x.person],
    controlRelationships: (x) => [x.owner, x.controller],
    arrivalCodes: (x) => [x.from],
  };
  const kept = emptyWorld();
  for (const part of WORLD_PARTS) {
    for (const [key, record] of Object.entries(source?.[part] || {})) {
      const named =
        part === 'identities' ? [] : (people[part]?.(record) ?? [key]);
      if (named.every((person) => real.has(person)))
        kept[part][key] = structuredClone(record);
    }
  }
  return kept;
}

const plain = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

const requestStatuses = new Set([
  'waiting',
  'Rated in',
  'Declined',
  'later',
  'ignored',
  'Sent',
  'Answered',
]);
const domains = ['interfold', 'uniqueness'];
const str = (x: unknown): x is string => typeof x === 'string';
const confidence = (x: unknown) =>
  Number.isInteger(x) && (x as number) >= 1 && (x as number) <= 4;

function validRecord(part: Part, key: string, item: WorldRecord): boolean {
  switch (part) {
    case 'arrivalCodes':
      return (
        /^[A-Z0-9]{6}$/.test(key) &&
        str(item.from) &&
        Number.isFinite(item.time)
      );
    case 'invites':
      return (
        /^[0-9a-f]{32}$/.test(key) &&
        str(item.inviter) &&
        str(item.name) &&
        !!item.name.trim() &&
        item.name.length <= 80 &&
        (item.role === undefined ||
          ['operator', 'player'].includes(item.role)) &&
        Number.isFinite(item.createdAt) &&
        (item.claimedBy === undefined ||
          (str(item.claimedBy) && item.claimedBy.length <= 80))
      );
    case 'identities':
      return str(item.name) && item.name.length <= 80;
    case 'answers':
      return (
        str(item.rater) &&
        str(item.subject) &&
        domains.includes(item.domain) &&
        (item.role === undefined ||
          ['subject', 'player', 'trainer', 'manager'].includes(item.role)) &&
        Number.isInteger(item.question) &&
        typeof item.yes === 'boolean' &&
        confidence(item.conf) &&
        str(item.time)
      );
    case 'outgoing':
      return (
        str(item.from) &&
        str(item.to) &&
        domains.includes(item.domain) &&
        (item.kind === undefined || str(item.kind)) &&
        str(item.time)
      );
    case 'playerRequests':
      return (
        str(item.from) &&
        str(item.to) &&
        domains.includes(item.domain) &&
        (item.role === undefined ||
          ['player', 'trainer', 'manager'].includes(item.role)) &&
        str(item.time) &&
        requestStatuses.has(item.status) &&
        (item.conf === undefined || confidence(item.conf))
      );
    case 'nodes':
      return (
        str(item.owner) &&
        str(item.id) &&
        key === worldKey(item.owner, item.id) &&
        str(item.address) &&
        item.address.length <= 200 &&
        str(item.location) &&
        str(item.added)
      );
    case 'nameGrants':
      return str(item.viewer) && str(item.person);
    case 'controlRelationships':
      return (
        str(item.owner) &&
        str(item.controller) &&
        item.controller.length <= 80 &&
        key === worldKey(item.owner, item.controller)
      );
  }
  if (!Object.hasOwn(item, 'value')) return false;
  switch (part) {
    case 'nodeAddress':
      return str(item.value) && item.value.length <= 200;
    case 'nodesComplete':
    case 'sharedControlAnswered':
    case 'nodeReady':
      return typeof item.value === 'boolean';
    case 'teamAsked':
    case 'nodeAnswered':
      return str(item.value);
    case 'arrivalRole':
      return ['operator', 'player', 'trainer', 'manager'].includes(item.value);
    case 'nameVisibility':
      return ['private', 'players', 'shared', 'findable'].includes(item.value);
  }
}

/** Keep only well-formed, stamped records. Anything else in `input` is dropped. */
export function cleanWorld(input: unknown): World {
  const clean = emptyWorld();
  if (!plain(input)) return clean;
  for (const part of WORLD_PARTS) {
    const records = input[part];
    if (!plain(records)) continue;
    for (const [key, item] of Object.entries(records)) {
      if (
        !plain(item) ||
        ['__proto__', 'constructor', 'prototype'].includes(key)
      )
        continue;
      if (
        !Number.isFinite(item.updatedAt) ||
        !str(item.by) ||
        !validRecord(part, key, item)
      )
        continue;
      clean[part][key] = (
        part === 'invites' ? { ...item, role: item.role || 'operator' } : item
      ) as StampedRecord;
    }
  }
  return clean;
}

const payload = (record: StampedRecord | undefined) => {
  const {
    updatedAt: _updatedAt,
    by: _by,
    removed: _removed,
    ...value
  } = record || ({} as StampedRecord);
  return value;
};

/**
 * The next world after `actor` changes their records at time `at`. Only records
 * whose content changed get a new stamp. A record missing from `records`
 * becomes a tombstone, so the removal wins the merge in other browsers.
 */
export function stampedWorld(
  records: Records,
  previous: World,
  actor: string,
  at: number,
): World {
  const next = mergeWorld(previous, emptyWorld());
  for (const part of WORLD_PARTS) {
    for (const [key, value] of Object.entries(records[part])) {
      const old = previous[part]?.[key];
      if (
        old &&
        !old.removed &&
        JSON.stringify(payload(old)) === JSON.stringify(value)
      )
        continue;
      next[part][key] = { ...value, updatedAt: at, by: actor };
    }
    for (const [key, old] of Object.entries(previous[part] || {}))
      if (!(key in records[part]) && !old.removed)
        next[part][key] = { ...old, removed: true, updatedAt: at, by: actor };
  }
  return next;
}
