import { createStore, produce } from 'solid-js/store';
import { choiceKey, level, votes } from '@/model/derive';
import { Q } from '@/model/questions';
import type { Seed } from '@/model/seed';
import type {
  Answer,
  Invite,
  Levels,
  NameGrant,
  Outgoing,
  PlayerRequest,
  PracticeNode,
  Role,
} from '@/model/types';
import { PendingOp } from './pending-op';
import type {
  Adapter,
  Connection,
  EvaluateArgs,
  InviteRow,
  RequestRow,
  Verifications,
} from './types';

const DOMAIN = 'interfold';

export interface PracticeState {
  /** The practice persona acting now; 'newcomer' is signed out. */
  persona: string;
  answers: Answer[];
  outgoing: Outgoing[];
  playerRequests: PlayerRequest[];
  nameGrants: NameGrant[];
  invites: Record<string, Invite>;
  nodes: Record<string, PracticeNode[]>;
  controlRelationships: Record<string, string[]>;
  connections: { from: string; to: string; time: string }[];
  /** Later or Ignore, chosen by a request's recipient. Keyed by `choiceKey(recipient, sender)`. */
  choices: Record<string, 'later' | 'ignored'>;
  playerReady: Record<string, boolean>;
  promotedRoles: Record<string, Record<string, Levels>>;
  nodeDeclared: Record<string, boolean>;
  nodeAddress: Record<string, string>;
  nodeReady: Record<string, boolean>;
  nodesComplete: Record<string, boolean>;
  nodeAnswered: Record<string, string>;
  sharedControlAnswered: Record<string, boolean>;
  teamAsked: Record<string, string>;
  arrivalRole: Record<string, string>;
  nameVisibility: Record<string, string>;
  /** People who joined a shared room as themselves, not as a practice persona. Nothing fills it yet; the room sync will. */
  created: string[];
  /** Practice switch: the next ask fails, to show the failed state. */
  failNextSend: boolean;
}

export interface MockOptions {
  /**
   * Set in a shared room. An edited answer keeps its place in the list, and
   * this adapter does not promote trainers or managers. In vouch-app, a shared
   * room's promotions are worked out when the room's world is applied; here
   * that is the job of the room sync, which is not written yet.
   */
  shared?: boolean;
  /** The undo window, in ms. */
  delay?: number;
  /** Runs after each applied write. The room sync, not written yet, will use it to send changes to the room. */
  onCommit?: () => void;
}

export type MockAdapter = ReturnType<typeof createMockAdapter>;

/** The practice adapter: the one owner of mutable practice state. */
export function createMockAdapter(
  data: Seed,
  { shared = false, delay, onCommit }: MockOptions = {},
) {
  const [state, setState] = createStore<PracticeState>({
    persona: 'newcomer',
    answers: structuredClone(data.answers),
    outgoing: structuredClone(data.outgoing),
    playerRequests: structuredClone(data.playerRequests),
    nameGrants: structuredClone(data.nameGrants),
    invites: structuredClone(data.invites),
    nodes: structuredClone(data.nodes),
    controlRelationships: structuredClone(data.controlRelationships),
    connections: [],
    choices: {},
    playerReady: {},
    promotedRoles: {},
    nodeDeclared: {},
    nodeAddress: {},
    nodeReady: {},
    nodesComplete: {},
    nodeAnswered: {},
    sharedControlAnswered: {},
    teamAsked: {},
    arrivalRole: {},
    nameVisibility: {},
    created: [],
    failNextSend: false,
  });
  const change = (fn: (draft: PracticeState) => void) => setState(produce(fn));
  const pending = (send: () => void) =>
    new PendingOp(send, { delay, onCommit });

  // Practice ladder: Yes answers from two current managers admit a trainer or manager.
  const roleProgress = (id: string, role: Role) => {
    const requests = state.playerRequests.filter(
      (x) => x.from === id && x.domain === DOMAIN && x.role === role,
    );
    const yes = state.answers.filter(
      (a) =>
        a.subject === id &&
        a.domain === DOMAIN &&
        a.role === role &&
        a.yes &&
        (api.getVerifications(a.rater).categories.manager?.level ?? 0) >= 1,
    );
    return {
      requests: requests as RequestRow[],
      yes: new Set(yes.map((a) => a.rater)).size,
      required: 2,
    };
  };

  const api = {
    state,
    data,
    setState,

    session: () =>
      state.persona === 'newcomer'
        ? null
        : { id: data.ids[state.persona], name: data.names[state.persona] },

    getVerifications(id: string): Verifications {
      const roles = {
        ...(data.levels[id] || (state.playerReady[id] ? { player: 1 } : {})),
        ...state.promotedRoles[id]?.[DOMAIN],
      };
      return {
        block: 39984000,
        categories: {
          ...Object.fromEntries(
            Q.map((q, i) => [
              q,
              {
                level: level(api, id, i),
                score: 0,
                impacts: votes(api, id, i),
              },
            ]),
          ),
          ...Object.fromEntries(
            Object.entries(roles).map(([role, lvl]) => [
              role,
              { level: lvl, score: 0, impacts: [] },
            ]),
          ),
        },
      };
    },

    getConnections(
      id: string,
      direction: 'inbound' | 'outbound',
    ): Connection[] {
      const inbound = direction === 'inbound';
      const grouped = new Map<string, Connection>();
      for (const edge of state.connections.filter((edge) =>
        inbound ? edge.to === id : edge.from === id,
      )) {
        const other = inbound ? edge.from : edge.to;
        grouped.set(other, {
          id: other,
          timestamp: edge.time,
          evaluations: [],
        });
      }
      for (const a of state.answers.filter((a) =>
        inbound ? a.subject === id : a.rater === id,
      )) {
        const other = inbound ? a.rater : a.subject;
        let row = grouped.get(other);
        if (!row) {
          row = { id: other, timestamp: a.time, evaluations: [] };
          grouped.set(other, row);
        }
        row.evaluations.push({
          domain: a.domain,
          category: a.role || a.kind || 'subject',
          question: a.domain === DOMAIN ? Q[a.question] : undefined,
          positive: a.yes,
          confidence: a.conf,
          modified: a.time,
          edited: a.edited,
          assumed: a.assumed,
        });
        if (a.time > row.timestamp) row.timestamp = a.time;
      }
      return [...grouped.values()];
    },

    evaluate(args: EvaluateArgs) {
      const actor = state.persona;
      return pending(() => {
        const question = args.question ?? 0;
        const time = new Date().toISOString();
        const role = args.category;
        const same = (a: Answer) =>
          a.domain === DOMAIN &&
          a.subject === args.evaluated &&
          a.rater === actor &&
          a.question === question &&
          (a.role || 'subject') === role;
        change((s) => {
          const answer: Answer = {
            domain: DOMAIN,
            subject: args.evaluated,
            rater: actor,
            question,
            yes: args.positive,
            conf: args.confidence,
            time,
            edited: s.answers.some(same),
            role,
            kind: role === 'trainer' || role === 'manager' ? role : undefined,
          };
          // A shared room keeps the answer's place, so other browsers see an edit, not a new row.
          const index = shared ? s.answers.findIndex(same) : -1;
          if (index >= 0) s.answers[index] = answer;
          else {
            s.answers = s.answers.filter((a) => !same(a));
            s.answers.push(answer);
          }
          if (role === 'player')
            s.playerReady[args.evaluated] = s.answers.some(
              (a) =>
                a.subject === args.evaluated &&
                a.domain === DOMAIN &&
                a.role === 'player' &&
                a.yes,
            );
          if (role === 'subject') return;
          const request = s.playerRequests.find(
            (x) =>
              x.domain === DOMAIN &&
              x.from === args.evaluated &&
              x.to === actor &&
              (role === 'player'
                ? !x.role || x.role === 'player'
                : x.role === role),
          );
          if (request) {
            request.status = args.positive ? 'Rated in' : 'Declined';
            request.conf = args.confidence;
            request.decided = time;
            if (role !== 'player')
              request.admittedByManager =
                (api.getVerifications(actor).categories.manager?.level ?? 0) >=
                1;
          }
        });
        if ((role === 'trainer' || role === 'manager') && !shared)
          admitPracticeRole(args.evaluated, role);
      });
    },

    connect({ to }: { to: string }) {
      const actor = state.persona;
      return pending(() =>
        change((s) => {
          s.connections.push({
            from: actor,
            to,
            time: new Date().toISOString(),
          });
          s.nameGrants.push({ viewer: to, person: actor });
        }),
      );
    },

    linkAddress({ address }: { address: string }) {
      const actor = state.persona;
      return pending(() =>
        change((s) => {
          s.nodeAddress[actor] = address;
          (s.nodes[actor] ||= []).push({
            id: shared
              ? Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
                  b.toString(16).padStart(2, '0'),
                ).join('')
              : undefined,
            address,
            location: 'Hetzner · Helsinki',
            added: new Date().toISOString(),
          });
          s.nodeDeclared[actor] = true;
        }),
      );
    },

    unlinkAddress() {
      const actor = state.persona;
      return pending(() =>
        change((s) => {
          const address = s.nodeAddress[actor];
          delete s.nodeAddress[actor];
          s.nodes[actor] = (s.nodes[actor] || []).filter(
            (node) => node.address !== address,
          );
          delete s.nodeDeclared[actor];
        }),
      );
    },

    disclosure: {
      get: (id: string) => ({
        nodes: state.nodes[id] || [],
        controlRelationships: state.controlRelationships[id] || [],
      }),
      setRelationships: (id: string, relationships: string[]) =>
        setState('controlRelationships', id, relationships),
    },

    requests: {
      roleProgress,
      ask({ to, category }: { to: string; category: string }) {
        const from = state.persona;
        return pending(() => {
          if (state.failNextSend) {
            setState('failNextSend', false);
            throw new Error('Practice send failed');
          }
          const time = new Date().toISOString();
          change((s) => {
            if (category === 'team') s.teamAsked[from] = time;
            else if (
              category === 'player' ||
              category === 'trainer' ||
              category === 'manager'
            )
              s.playerRequests.push({
                from,
                to,
                domain: DOMAIN,
                role: category,
                time,
                status: 'waiting',
              });
            else
              s.outgoing.push({
                from,
                to,
                domain: DOMAIN,
                kind: category,
                time,
              });
            s.nameGrants.push({ viewer: to, person: from });
          });
        });
      },
      list: (): (RequestRow | InviteRow)[] => [
        ...state.outgoing,
        ...state.playerRequests,
        ...Object.entries(state.teamAsked)
          .filter(([, time]) => Boolean(time))
          .map(([from, time]) => ({
            from,
            to: 'team',
            domain: DOMAIN,
            category: 'team',
            time,
          })),
        ...Object.values(state.invites).map((invite) => ({
          ...invite,
          category: 'invite' as const,
        })),
      ],
      defer: ({
        from,
        to,
        kind,
      }: {
        from: string;
        to: string;
        kind: 'later' | 'ignored';
      }) => setState('choices', choiceKey(to, from), kind),
      restore: ({ from, to }: { from: string; to: string }) =>
        change((s) => {
          delete s.choices[choiceKey(to, from)];
        }),
    },
  };

  function admitPracticeRole(id: string, role: 'trainer' | 'manager') {
    const progress = roleProgress(id, role);
    if (
      progress.yes < progress.required ||
      state.promotedRoles[id]?.[DOMAIN]?.[role]
    )
      return;
    change((s) => {
      ((s.promotedRoles[id] ||= {})[DOMAIN] ||= {})[role] = 1;
    });
  }

  return api satisfies Adapter;
}
