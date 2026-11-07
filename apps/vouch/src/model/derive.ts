import type { MockAdapter } from '@/adapter/mock';
import type { RequestRow, Vote } from '@/adapter/types';
import { Q, QUESTIONS } from './questions';
import { extraVotes, lenaSeed, uniquenessManagers } from './seed';
import type { Answer } from './types';

// Every screen derives what it shows from the functions in this file, so the
// board, the request queue and the history always agree. They read only
// Interfold answers and requests.

type Api = MockAdapter;

/** The key of a Later or Ignore choice: `to` set it on `from`'s request. */
export const choiceKey = (to: string, from: string) =>
  [to, 'interfold', from].join(':');

/** An operator: [id, node count, seeded endorsements], or null for anyone else. */
export function op(api: Api, k: string) {
  const nodes = api.disclosure.get(k).nodes.length;
  return (
    api.data.operators.find((o) => o[0] === k) ??
    (api.state.nodeDeclared[k] || nodes ? ([k, nodes, []] as const) : null)
  );
}

/** The answers to question `q` about operator `k`: seeded endorsements, then recorded answers. */
export function votes(api: Api, k: string, q: number): Vote[] {
  const operator = op(api, k);
  if (!operator) return [];
  const ratings = api.data.times.ratings;
  const recorded = api.getConnections(k, 'inbound').flatMap((row) =>
    row.evaluations
      .filter(
        (e) =>
          e.domain === 'interfold' &&
          e.category === 'subject' &&
          e.question === Q[q],
      )
      .map((e) => ({
        r: row.id,
        yes: e.positive,
        c: e.confidence,
        t: e.modified,
      })),
  );
  const base = operator[2]
    .filter(([r]) => !recorded.some((vote) => vote.r === r))
    .map(([r, c], i) => ({ r, yes: true, c, t: ratings[i % 3] }));
  const extra = (extraVotes[k]?.[q] || []).map((r, i) => ({
    r,
    yes: true,
    c: 3,
    t: ratings[i % 3],
  }));
  const result = base.concat(extra, recorded);
  // The practice world's one standing No: Priya doubts Idris's self-custody.
  if (k === 'idris' && q === 1)
    result.push({ r: 'priya', yes: false, c: 4, t: ratings[2] });
  return result;
}

/** The number of Yes answers to question `q`, capped at 2; -1 for Idris's self-custody, the standing No. */
export function level(api: Api, k: string, q: number) {
  if (k === 'idris' && q === 1) return -1;
  return Math.min(2, votes(api, k, q).filter((x) => x.yes).length);
}

export type OperatorStatus = 'Held back by a No' | 'Seated' | 'Pending';

/** Seated needs two Yes answers to every question; any No holds the operator back. */
export function deriveStatus(api: Api, id: string): OperatorStatus {
  const perQuestion = QUESTIONS.map((q) => votes(api, id, q));
  if (perQuestion.flat().some((x) => !x.yes)) return 'Held back by a No';
  return perQuestion.every((v) => v.filter((x) => x.yes).length >= 2)
    ? 'Seated'
    : 'Pending';
}

export interface QueueRow {
  from: string;
  type: 'operator' | 'player' | 'trainer' | 'manager';
  time: string;
  status: RequestStatus;
  role?: string;
  to?: string;
}

export const requestStatuses = [
  'New',
  'Pending',
  'Seated',
  'Disputed',
  'Player ask',
  'Trainer ask',
  'Manager ask',
  'Later',
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

/**
 * `id`'s manager level. Without an Interfold one, it is their level in
 * `uniquenessManagers`. The standalone vouch-app, which this code is ported
 * from, does the same, so both show the same practice queues. A level of 1 or
 * more shows trainer and manager asks in the queue.
 */
export const managerLevel = (api: Api, id: string) =>
  api.getVerifications(id).categories.manager?.level ??
  uniquenessManagers[id] ??
  0;

/** Operators asking `p` for an endorsement that `p` has not fully answered yet. */
export function incomingRequests(api: Api, p: string, now = Date.now()) {
  const ratings = api.data.times.ratings;
  const incoming: Omit<QueueRow, 'status'>[] = [];
  if (p === 'nora' || p === 'auryn')
    for (const from of ['idris', 'sofia', 'leo'])
      incoming.push({ from, type: 'operator', time: ratings[1] });
  if (p === 'lena') {
    incoming.push({ from: 'leo', type: 'operator', time: ratings[2] });
    for (const [from, minutes] of lenaSeed)
      if (!['maya', 'hanne', 'sofia', 'viktor'].includes(from))
        incoming.push({
          from,
          type: 'operator',
          time: new Date(now - minutes * 60000).toISOString(),
        });
  } else if (api.state.playerReady[p])
    incoming.push({ from: 'leo', type: 'operator', time: ratings[2] });
  for (const x of api.requests.list())
    if ('kind' in x && x.kind && x.domain === 'interfold' && x.to === p)
      incoming.push({ from: x.from, type: 'operator', time: x.time });
  const answeredAll = (from: string) =>
    Q.every((question) =>
      api
        .getConnections(from, 'inbound')
        .some(
          (row) =>
            row.id === p &&
            row.evaluations.some(
              (e) =>
                e.domain === 'interfold' &&
                e.category === 'subject' &&
                e.question === question,
            ),
        ),
    );
  return incoming
    .filter(
      (request) =>
        api.disclosure.get(request.from).nodes.length > 0 &&
        !answeredAll(request.from),
    )
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
}

export function deriveRequestStatus(
  api: Api,
  row: Pick<QueueRow, 'from' | 'type'>,
): RequestStatus {
  if (row.type === 'player') return 'Player ask';
  if (row.type === 'manager') return 'Manager ask';
  if (!QUESTIONS.some((q) => votes(api, row.from, q).length)) return 'New';
  const status = deriveStatus(api, row.from);
  return status === 'Held back by a No' ? 'Disputed' : status;
}

/** `id`'s request queue, split into the sections the requests screen shows. */
export function deriveRequestQueue(api: Api, id: string, now = Date.now()) {
  const waiting = api.state.playerRequests.filter(
    (row) =>
      row.domain === 'interfold' && row.to === id && row.status === 'waiting',
  );
  const incoming: QueueRow[] = incomingRequests(api, id, now).map((row) => ({
    ...row,
    status: deriveRequestStatus(api, row),
  }));
  const player: QueueRow[] = waiting
    .filter((row) => !row.role || row.role === 'player')
    .map((row) => ({ ...row, type: 'player', status: 'Player ask' }));
  // Nora and Auryn, the practice managers, each have the other's trainer ask waiting.
  const trainer: QueueRow[] =
    id === 'nora' || id === 'auryn'
      ? [
          {
            from: id === 'nora' ? 'auryn' : 'nora',
            type: 'trainer',
            time: api.data.times.ratings[0],
            status: 'Trainer ask',
          },
        ]
      : [];
  const roleAsks: QueueRow[] =
    managerLevel(api, id) >= 1
      ? waiting
          .filter((row) => row.role === 'trainer' || row.role === 'manager')
          .map((row) => ({
            ...row,
            type: row.role as 'trainer' | 'manager',
            status: row.role === 'trainer' ? 'Trainer ask' : 'Manager ask',
          }))
      : [];
  const all = [...incoming, ...player, ...trainer, ...roleAsks];
  const choice = (row: QueueRow) => api.state.choices[choiceKey(id, row.from)];
  const later = all
    .filter((row) => choice(row) === 'later')
    .map((row) => ({ ...row, status: 'Later' as const }));
  const active = all.filter((row) => !choice(row));
  return {
    incoming: active.filter(
      (row) => row.status !== 'Player ask' && row.status !== 'Trainer ask',
    ),
    player: active.filter((row) => row.status === 'Player ask'),
    trainer: active.filter((row) => row.status === 'Trainer ask'),
    later,
    ignored: all.filter((row) => choice(row) === 'ignored'),
    rows: [...active, ...later],
  };
}

export function deriveRequestBreakdown(api: Api, id: string, now = Date.now()) {
  const counts = Object.fromEntries(
    requestStatuses.map((status) => [status, 0]),
  ) as Record<RequestStatus, number>;
  for (const row of deriveRequestQueue(api, id, now).rows) counts[row.status]++;
  return counts;
}

export interface HistoryRow {
  subject: string;
  answers: Answer[];
  time: string;
  /** The player ask `id` rated in, when no player answer is recorded. */
  player?: RequestRow;
}

/** Everyone `id` has answered or rated in, newest first. */
export function deriveHistory(api: Api, id: string): HistoryRow[] {
  const people = new Map<string, HistoryRow>();
  for (const connection of api.getConnections(id, 'outbound')) {
    const row: HistoryRow = people.get(connection.id) || {
      subject: connection.id,
      answers: [],
      time: '',
    };
    for (const e of connection.evaluations.filter(
      (x) => x.domain === 'interfold',
    )) {
      row.answers.push({
        domain: 'interfold',
        subject: connection.id,
        rater: id,
        question: Q.indexOf(e.question as (typeof Q)[number]),
        role: e.category as Answer['role'],
        kind: e.category === 'trainer' ? 'trainer' : undefined,
        yes: e.positive,
        conf: e.confidence,
        time: e.modified,
        edited: e.edited,
      });
      if (e.modified > row.time) row.time = e.modified;
    }
    if (row.answers.length) people.set(connection.id, row);
  }
  for (const x of api.requests.list()) {
    if (
      !('domain' in x) ||
      x.domain !== 'interfold' ||
      x.to !== id ||
      x.status !== 'Rated in'
    )
      continue;
    const row = people.get(x.from) || {
      subject: x.from,
      answers: [],
      time: '',
    };
    if (!row.answers.some((a) => a.role === 'player')) row.player = x;
    if (x.decided && x.decided > row.time) row.time = x.decided;
    people.set(x.from, row);
  }
  return [...people.values()].sort((a, b) => b.time.localeCompare(a.time));
}
