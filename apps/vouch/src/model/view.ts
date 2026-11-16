import type { MockAdapter } from '@/adapter/mock';
import {
  deriveRequestQueue,
  managerLevel,
  votes,
  type HistoryRow,
  type QueueRow,
} from './derive';
import { Q, QUESTIONS, owners } from './questions';
import { FOUNDING_TEAM } from './seed';
import type { Role } from './types';

// What the screens show, worked out from the adapter, for the Interfold
// domain only. These screens are ported from the standalone vouch-app
// (github.com/BrightID/vouch-app), and each function gives what that app shows
// for the same practice state.

type Api = MockAdapter;
const DOMAIN = 'interfold';

export type AnswerKind = 'question' | 'player' | 'trainer' | 'manager';

export const isFounder = (k: string) => FOUNDING_TEAM.includes(k);

const capital = (s: string) => s[0].toUpperCase() + s.slice(1);

export const interfoldPlayer = (api: Api, k: string) =>
  isFounder(k) ||
  [...owners, 'lena', 'oskar', 'priya', 'jonas', 'farah'].includes(k) ||
  !!api.state.playerReady[k];

export const isPlayer = (api: Api, p: string) =>
  interfoldPlayer(api, p) ||
  api.state.playerRequests.some(
    (x) => x.domain === DOMAIN && x.from === p && x.status === 'Rated in',
  );

/** Founders hold every rated role in Interfold; anyone else needs level 1. */
export const hasRole = (api: Api, k: string, role: Role) =>
  (isFounder(k) && role !== 'subject') ||
  (api.getVerifications(k).categories[role]?.level ?? 0) >= 1;

export const visibility = (api: Api, k: string) =>
  api.state.nameVisibility[k] ||
  (['dara', 'lena', 'nora', 'oskar', 'priya'].includes(k)
    ? 'findable'
    : ['jonas', 'farah'].includes(k)
      ? 'players'
      : 'private');

/** Whether the persona acting now may see `k`'s name. */
export function canSeeName(api: Api, k: string) {
  const viewer = api.state.persona;
  const seen = visibility(api, k);
  return (
    k === viewer ||
    owners.includes(k) ||
    (api.data.grants[viewer] || []).includes(k) ||
    api.state.nameGrants.some((g) => g.viewer === viewer && g.person === k) ||
    seen === 'findable' ||
    (seen === 'players' && interfoldPlayer(api, viewer))
  );
}

/** `k`'s name if the persona may see it, else the start of their key. */
export function label(api: Api, k: string) {
  const identity = api.state.identities[k];
  if (canSeeName(api, k)) return api.data.names[k] ?? identity?.name ?? k;
  const key = api.data.ids[k] ?? (identity ? k : undefined);
  return key ? key.slice(0, 8) + '…' : k;
}

export function ago(t: string | undefined, now = Date.now()) {
  if (!t) return 'Time not recorded';
  const m = Math.floor(Math.max(0, now - new Date(t).getTime()) / 60000);
  return m < 1
    ? 'just now'
    : m < 60
      ? m + 'm'
      : m < 1440
        ? Math.floor(m / 60) + 'h'
        : m < 43200
          ? Math.floor(m / 1440) + 'd'
          : m < 525600
            ? Math.floor(m / 43200) + 'M'
            : Math.floor(m / 525600) + 'Y';
}

/** The colour a status word gets: good, bad, pending, dim or none. */
export function stateClass(s: string) {
  if (s === 'Not verified unique') return 'dim';
  if (
    /^(Yes|Seated|Verified|Answered|Rated in|Unique ·|Subject L|Player L|Trainer L|Manager L)/.test(
      s,
    )
  )
    return 'good';
  if (/^(No|Disputed|Held back|Declined)/.test(s) || /disputed/.test(s))
    return 'bad';
  if (/^(Pending|Waiting|Sent)/.test(s) || /pending|player ask/i.test(s))
    return 'pending';
  return '';
}

export const confidenceFromHold = (ms: number) =>
  ms < 300 ? 1 : ms < 700 ? 2 : ms < 1200 ? 3 : 4;

/** The fewest Yes answers `p` has on any one question. */
export const operatorYes = (api: Api, p: string) =>
  Math.min(
    ...QUESTIONS.map((q) => votes(api, p, q).filter((v) => v.yes).length),
  );

/** The first No on `p`, with the question's name. */
export const operatorNo = (api: Api, p: string) =>
  QUESTIONS.flatMap((q) =>
    votes(api, p, q)
      .filter((v) => !v.yes)
      .map((v) => ({ ...v, question: Q[q] })),
  )[0];

/** The endorsement asks `p` has sent, plus an ask to the team. */
export function operatorAsked(api: Api, p: string) {
  const people: { from: string; to: string; time: string }[] =
    api.state.outgoing.filter(
      (x) =>
        x.from === p &&
        x.domain === DOMAIN &&
        (x.kind || 'endorsement') === 'endorsement',
    );
  const team = api.state.teamAsked[p];
  return team ? people.concat({ from: p, to: 'team', time: team }) : people;
}

export const sharedControlDone = (api: Api, p: string) =>
  !!api.state.sharedControlAnswered[p] ||
  api.data.operators.some((x) => x[0] === p);

export const isOperator = (api: Api, p: string) =>
  api.state.arrivalRole[p] === 'operator' ||
  api.disclosure.get(p).nodes.length > 0 ||
  api.data.operators.some((x) => x[0] === p) ||
  operatorAsked(api, p).length > 0;

export interface RoleChip {
  role: 'subject' | 'operator' | 'player' | 'trainer' | 'manager';
  level?: number;
  state?: 'seated' | 'held back' | 'getting endorsed';
}

/** The role chips on `p`'s home, and an open trainer or manager ask's progress. */
export function roleChips(api: Api, p: string) {
  const levels = api.getVerifications(p).categories;
  const asked = (role: Role) =>
    api.state.playerRequests.some(
      (x) =>
        x.from === p &&
        x.domain === DOMAIN &&
        (role === 'player' ? !x.role || x.role === 'player' : x.role === role),
    );
  const items: RoleChip[] = [];
  if (levels.subject?.level)
    items.push({ role: 'subject', level: levels.subject.level });
  if (isOperator(api, p)) {
    const no = operatorNo(api, p);
    const ready =
      api.disclosure.get(p).nodes.length && operatorYes(api, p) >= 2 && !no;
    items.push({
      role: 'operator',
      state: ready ? 'seated' : no ? 'held back' : 'getting endorsed',
    });
  }
  if (isPlayer(api, p)) items.push({ role: 'player' });
  else if (api.state.arrivalRole[p] === 'player' || asked('player'))
    items.push({ role: 'player', state: 'getting endorsed' });
  for (const role of ['trainer', 'manager'] as const)
    if (isFounder(p) || (levels[role]?.level ?? 0) >= 1) items.push({ role });
    else if (asked(role)) items.push({ role, state: 'getting endorsed' });
  const openAsk = (['trainer', 'manager'] as const)
    .map((role) => ({ role, ...api.requests.roleProgress(p, role) }))
    .find((x) => x.requests.length && (levels[x.role]?.level ?? 0) < 1);
  return { items, openAsk };
}

export const chipName = (role: RoleChip['role']) =>
  role === 'operator'
    ? 'Node operator'
    : role === 'subject'
      ? 'Unique'
      : capital(role);

/** How many rows of each kind wait in a request queue. */
export function requestKinds(rows: QueueRow[]) {
  const counts = { player: 0, trainer: 0, manager: 0, operator: 0 };
  for (const row of rows)
    counts[row.type === 'operator' ? 'operator' : row.type]++;
  return counts;
}

export type HomeCard =
  | 'player'
  | 'trainer'
  | 'manager'
  | 'choose-role'
  | 'list-nodes'
  | 'more-nodes'
  | 'shared-control'
  | 'held-back'
  | 'all-set'
  | 'waiting'
  | 'get-endorsed'
  | null;

/** Which status card `p`'s home shows. */
export function homeCard(api: Api, p: string): HomeCard {
  const nodeCount = api.disclosure.get(p).nodes.length;
  const asked = operatorAsked(api, p).length;
  const yes = operatorYes(api, p);
  const role = api.state.arrivalRole[p];
  const controlDone = sharedControlDone(api, p);
  const seeded = api.data.operators.some((x) => x[0] === p);
  if (role === 'player' && !isOperator(api, p)) return 'player';
  if (role === 'trainer' || role === 'manager') return role;
  if (!role && !nodeCount && !asked && !seeded && !isFounder(p))
    return 'choose-role';
  if ((role === 'operator' || seeded) && !nodeCount) return 'list-nodes';
  if (nodeCount && !api.state.nodesComplete[p] && !controlDone)
    return 'more-nodes';
  if (nodeCount && !controlDone) return 'shared-control';
  if (operatorNo(api, p)) return 'held-back';
  if (nodeCount && yes >= 2) return 'all-set';
  if (nodeCount && asked >= 2) return 'waiting';
  if (nodeCount) return 'get-endorsed';
  return isFounder(p) ? null : 'choose-role';
}

/** The name shown for an ask's recipient in its sender's "Your asks" list. */
export function askName(api: Api, x: { from: string; to: string }) {
  const invitedBy = Object.values(api.state.invites).some(
    (invite) => invite.claimedBy === x.from && invite.inviter === x.to,
  );
  if (invitedBy || isFounder(x.to)) return api.data.names[x.to] || x.to;
  return x.to === 'team'
    ? 'Interfold team'
    : x.to.startsWith('link:')
      ? 'Someone you sent a link to'
      : label(api, x.to);
}

/** `to`'s answers on operator `p`: No if any No, Yes once all three are Yes. */
export function askStatus(api: Api, p: string, to: string) {
  const v = QUESTIONS.flatMap((q) => votes(api, p, q)).filter(
    (v) => v.r === to,
  );
  if (v.some((x) => !x.yes)) return 'No';
  return v.length === Q.length ? 'Yes' : 'Waiting';
}

/** What Interfold reads for question `q` about `p`. */
export function partnerAnswer(api: Api, p: string, q: number) {
  const v = votes(api, p, q);
  if (v.some((x) => !x.yes)) return 'No';
  return v.filter((x) => x.yes).length >= 2 ? 'Yes' : 'Not decided yet';
}

/** Whether `p` may give this kind of answer. */
export function canRate(api: Api, p: string, kind: AnswerKind) {
  if (kind === 'question')
    return (
      isFounder(p) ||
      (api.getVerifications(p).categories.player?.level ?? 0) >= 1
    );
  if (kind === 'player') return hasRole(api, p, 'trainer');
  return managerLevel(api, p) >= 1;
}

/** `rater`'s recorded answer of this kind about `subject`. */
export const ownAnswer = (
  api: Api,
  rater: string,
  kind: AnswerKind,
  subject: string,
  question: number,
) =>
  api.state.answers.find(
    (a) =>
      a.domain === DOMAIN &&
      a.subject === subject &&
      a.rater === rater &&
      a.question === question &&
      (a.role || 'subject') === (kind === 'question' ? 'subject' : kind),
  );

/** Whether `p` has answered all three questions about operator `k`. */
export function answeredAll(api: Api, p: string, k: string) {
  const own =
    api.getConnections(k, 'inbound').find((row) => row.id === p)?.evaluations ||
    [];
  return Q.every((q) =>
    own.some(
      (e) =>
        e.domain === DOMAIN && e.question === q && e.category === 'subject',
    ),
  );
}

/** The first request waiting on `p` from someone other than `after`. */
export function nextIncoming(api: Api, p: string, after: string) {
  const queue = deriveRequestQueue(api, p);
  return (
    [...queue.incoming, ...queue.player, ...queue.trainer].find(
      (x) => x.from !== after,
    ) ?? null
  );
}

/** The path that answers a queue row. */
export const answerPath = (row: Pick<QueueRow, 'from' | 'type'>) =>
  `/answer/${encodeURIComponent(row.from)}${row.type === 'operator' ? '' : '/' + row.type}`;

/** `id`'s highest role, for the persona list. */
export function topRole(api: Api, id: string) {
  const levels = api.getVerifications(id).categories;
  if (managerLevel(api, id) >= 1) return 'Manager';
  for (const role of ['trainer', 'player'])
    if ((levels[role]?.level ?? 0) >= 1) return capital(role);
  if (id === 'mira' || isOperator(api, id)) return 'Node operator';
  return 'Subject';
}

/** The practice cast offered in the persona list. */
export const PERSONAS = [
  'philip',
  'adam',
  'auryn',
  'mira',
  'idris',
  'dara',
  'viktor',
  'lena',
  'nora',
  'tomas',
  'ingrid',
  'priya',
  'oskar',
  'jonas',
  'farah',
  'maya',
  'kenji',
  'rosa',
];

export const personaLabel = (api: Api, id: string) =>
  `${api.data.names[id] ?? api.state.identities[id]?.name ?? id} · ${topRole(api, id)}`;

export type SentKind = 'ask' | 'team' | 'player' | 'trainer' | 'manager';

export interface SentAsk {
  to: string;
  time: string;
  request: SentKind;
  status?: string;
  conf?: number;
  answered: 'Yes' | 'No' | 'Waiting';
}

const OPEN = ['waiting', 'Sent', 'Pending'];

/**
 * The asks `p` sent, as `open` and `finished` rows, plus `finishedRoleAsks`:
 * the trainer and manager roles `p` asked for and now holds.
 */
export function sentAsks(api: Api, p: string) {
  const s = api.state;
  const all: Omit<SentAsk, 'answered'>[] = [
    ...s.outgoing
      .filter((x) => x.domain === DOMAIN && x.from === p)
      .map((x) => ({
        ...x,
        request: (['player', 'trainer', 'manager'].includes(x.kind || '')
          ? x.kind
          : 'ask') as SentKind,
      })),
    ...s.playerRequests
      .filter((x) => x.domain === DOMAIN && x.from === p)
      .map((x) => ({ ...x, request: x.role || 'player' })),
  ];
  const finishedRoleAsks = (['trainer', 'manager'] as const).filter(
    (role) =>
      hasRole(api, p, role) &&
      s.playerRequests.some(
        (x) => x.domain === DOMAIN && x.from === p && x.role === role,
      ),
  );
  if (s.teamAsked[p])
    all.push({
      to: 'team',
      time: s.teamAsked[p],
      request: 'team',
      status: 'waiting',
    });
  const operatorVotes = (to: string) =>
    QUESTIONS.flatMap((q) => votes(api, p, q)).filter((v) => v.r === to);
  const isOpen = (x: (typeof all)[number]) => {
    if (x.request === 'player') return OPEN.includes(x.status || '');
    if (x.request === 'trainer' || x.request === 'manager')
      return !hasRole(api, p, x.request) && OPEN.includes(x.status || '');
    if (x.to.startsWith('link:') || x.to === 'team') return true;
    const answers = operatorVotes(x.to);
    return !answers.some((v) => !v.yes) && answers.length < Q.length;
  };
  const answered = (x: (typeof all)[number]): SentAsk['answered'] => {
    if (x.request === 'ask' || x.request === 'team') {
      const answers = operatorVotes(x.to);
      return answers.some((v) => !v.yes)
        ? 'No'
        : answers.length >= Q.length
          ? 'Yes'
          : 'Waiting';
    }
    const answer = s.answers.find(
      (a) =>
        a.domain === DOMAIN &&
        a.subject === p &&
        a.rater === x.to &&
        a.role === x.request,
    );
    if (answer) return answer.yes ? 'Yes' : 'No';
    if (OPEN.includes(x.status || '')) return 'Waiting';
    return x.status === 'Rated in' || x.status === 'Yes' ? 'Yes' : 'No';
  };
  const rows = all.map((x) => ({ ...x, answered: answered(x) }));
  return {
    open: rows
      .filter((_, i) => isOpen(all[i]))
      .sort((a, b) => b.time.localeCompare(a.time)),
    finished: rows.filter((_, i) => !isOpen(all[i])),
    finishedRoleAsks,
  };
}

export const sentKindName = (kind: SentKind) =>
  kind === 'ask' || kind === 'team' ? 'Node operator' : capital(kind);

/** The role an earlier answer was about, or undefined for the operator questions. */
export const historyRole = (row: HistoryRow) =>
  (['manager', 'trainer', 'player'] as const).find((role) =>
    row.answers.some((a) => a.role === role),
  );

/** One earlier answer's short form, such as "Key · Yes · confidence 3". */
export const answerMark = (a: { role?: string; question: number }) =>
  !a.role || a.role === 'subject'
    ? ['Key', 'Self', 'Disclosure'][a.question] || 'Answer'
    : capital(a.role);
