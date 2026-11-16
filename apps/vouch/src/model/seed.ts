import { Q } from './questions';
import {
  grants,
  ids,
  names,
  operators,
  times,
  uniquenessManagers,
} from './personas';
import type {
  Answer,
  Invite,
  Levels,
  NameGrant,
  Outgoing,
  PlayerRequest,
  PracticeNode,
} from './types';

export { grants, ids, names, operators, times, uniquenessManagers };

export const FOUNDING_TEAM = ['philip', 'adam', 'auryn'];

/** Extra Yes answers per operator, one list per question. */
export const extraVotes: Record<string, string[][]> = {
  maya: [['auryn', 'tomas', 'ingrid', 'oskar'], [], []],
  rosa: [['auryn'], ['nora'], ['tomas']],
};

/** Operator asks that Lena sees: [from, minutes ago]. */
export const lenaSeed: [string, number][] = [
  ['maya', 3],
  ['kenji', 8],
  ['rosa', 17],
  ['idris', 32],
  ['hanne', 59],
  ['mateo', 130],
  ['amara', 310],
  ['sofia', 620],
  ['viktor', 1620],
  ['dara', 3200],
  ['yuki', 4980],
];

const nodeLocations: Record<string, string[]> = {
  idris: ['DigitalOcean · Nairobi'],
  viktor: [
    'Hetzner · Helsinki',
    'OVHcloud · Roubaix',
    'DigitalOcean · Singapore',
  ],
};

export interface Seed {
  ids: Record<string, string>;
  names: Record<string, string>;
  grants: Record<string, string[]>;
  operators: [string, number, [string, number][]][];
  times: typeof times;
  answers: Answer[];
  outgoing: Outgoing[];
  nameGrants: NameGrant[];
  playerRequests: PlayerRequest[];
  nodes: Record<string, PracticeNode[]>;
  controlRelationships: Record<string, string[]>;
  invites: Record<string, Invite>;
  levels: Record<string, Levels>;
}

/**
 * The Interfold practice world. Set `demo` for a shared room (the page was
 * opened with `?room=<name>`): there, Kenji, Rosa and Mateo start as new
 * operators waiting on their first endorsements.
 */
export function createSeed({
  demo = false,
  now = Date.now(),
}: { demo?: boolean; now?: number } = {}): Seed {
  const ago = (minutes: number) =>
    new Date(now - minutes * 60000).toISOString();
  const seedOperators = structuredClone(operators);
  if (demo)
    for (const operator of seedOperators)
      if (['kenji', 'rosa', 'mateo'].includes(operator[0])) operator[2] = [];

  const answers: Answer[] = (
    [
      ['lena', 'maya', 4],
      ['lena', 'hanne', 2],
      ['lena', 'sofia', 4],
      ['lena', 'viktor', 4],
      ['nora', 'maya', 4],
    ] as const
  ).flatMap(([rater, subject, conf], n) =>
    Q.map((_, question) => ({
      domain: 'interfold' as const,
      subject,
      rater,
      question,
      yes: true,
      conf,
      time: times.ratings[n % 3],
    })),
  );

  const asks: Outgoing[] = (
    [
      ['kenji', 'philip', 18],
      ['kenji', 'adam', 19],
      ['rosa', 'philip', 76],
      ['rosa', 'adam', 77],
      ['mateo', 'adam', 180],
    ] as const
  ).map(([from, to, minutes]) => ({
    from,
    to,
    domain: 'interfold',
    kind: 'endorsement',
    time: ago(minutes),
  }));

  return {
    ids: { ...ids },
    names: { ...names },
    grants: structuredClone(grants),
    operators: seedOperators,
    times,
    answers,
    outgoing: demo ? asks : asks.filter((x) => x.to === 'philip'),
    nameGrants: [
      ...(demo
        ? FOUNDING_TEAM.flatMap((viewer) =>
            Object.keys(names).map((person) => ({ viewer, person })),
          )
        : []),
      { viewer: 'auryn', person: 'dara' },
      { viewer: 'auryn', person: 'viktor' },
    ],
    playerRequests: [
      {
        from: 'dara',
        to: 'auryn',
        domain: 'interfold',
        time: '2026-09-27T14:04:00Z',
        status: 'waiting',
      },
      {
        from: 'viktor',
        to: 'auryn',
        domain: 'interfold',
        time: '2026-09-26T19:12:00Z',
        status: 'waiting',
      },
    ],
    nodes: Object.fromEntries(
      seedOperators.map(([id, count]) => [
        id,
        Array.from({ length: count }, (_, i) => ({
          address: `${id}-node-${i + 1}`,
          location: nodeLocations[id]?.[i] ?? 'Location unknown',
          added: times.ratings[i % 3],
        })),
      ]),
    ),
    controlRelationships: {
      idris: [],
      viktor: [],
      ...(demo ? { rosa: ['kenji'] } : {}),
    },
    invites: demo
      ? {
          '00000000000000000000000000000001': {
            inviter: 'philip',
            name: 'Sam',
            role: 'operator',
            createdAt: now - 28 * 60000,
          },
        }
      : {},
    levels: {
      dara: { player: 1 },
      nora: { player: 3, trainer: 1, manager: 1 },
      tomas: { player: 3, trainer: 1 },
      auryn: { player: 3, trainer: 1, manager: 1 },
      ingrid: { subject: 1, player: 1, trainer: 1 },
      lena: { player: 1 },
      oskar: { player: 1 },
      priya: { player: 1 },
      jonas: { player: 1 },
      farah: { player: 1 },
      ...(demo ? { rosa: { subject: 2 } } : {}),
    },
  };
}
