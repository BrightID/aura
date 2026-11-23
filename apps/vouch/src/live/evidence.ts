import { Q } from '@/model/questions';

// What the node returns for an operator's inbound connections, cut to the
// fields interfoldEvidence reads. Every field is `unknown` because the
// response comes from the network and is checked before use.
interface NodeEvaluation {
  evaluation?: unknown;
  confidence?: unknown;
  domain?: unknown;
  category?: unknown;
  modified?: unknown;
}
interface NodeConnection {
  id?: unknown;
  auraEvaluations?: NodeEvaluation[] | null;
}
export interface InboundResponse {
  data?: { connections?: NodeConnection[] | null };
}

/** One evaluator's latest valid answer to one question, built from the node's record. */
export interface LiveAnswer {
  evaluator: string;
  question: (typeof Q)[number];
  yes: boolean;
  confidence: number;
  /** The node's `modified` time, in ms. */
  modified: number;
}

/**
 * The current Interfold answers among an operator's inbound connections. A
 * record counts only with domain `Interfold`, one of the three question
 * categories, a positive or negative evaluation, and an integer confidence
 * from 1 to 4; everything else is dropped. For one evaluator and question,
 * only the latest record counts.
 */
export function interfoldEvidence(response: InboundResponse): LiveAnswer[] {
  const latest = new Map<string, LiveAnswer>();
  for (const connection of response.data?.connections ?? []) {
    if (typeof connection.id !== 'string' || !connection.id) continue;
    for (const e of connection.auraEvaluations ?? []) {
      const question = Q.find((q) => q === e.category);
      if (
        e.domain !== 'Interfold' ||
        !question ||
        (e.evaluation !== 'positive' && e.evaluation !== 'negative') ||
        !Number.isInteger(e.confidence) ||
        (e.confidence as number) < 1 ||
        (e.confidence as number) > 4 ||
        typeof e.modified !== 'number'
      )
        continue;
      const answer: LiveAnswer = {
        evaluator: connection.id,
        question,
        yes: e.evaluation === 'positive',
        confidence: e.confidence as number,
        modified: e.modified,
      };
      const key = `${answer.evaluator}:${question}`;
      const prior = latest.get(key);
      if (!prior || prior.modified < answer.modified) latest.set(key, answer);
    }
  }
  return [...latest.values()].sort((a, b) => b.modified - a.modified);
}

const READ_TIMEOUT_MS = 30_000;

/** Fetch an operator's inbound connections; throws on a failed or slow read. */
export async function fetchInbound(
  nodeUrl: string,
  operator: string,
): Promise<InboundResponse> {
  const res = await fetch(
    `${nodeUrl}/brightid/v6/users/${encodeURIComponent(operator)}/connections/inbound`,
    { signal: AbortSignal.timeout(READ_TIMEOUT_MS) },
  );
  // When the operator id names no user on the node, it answers 404 with errorNum 10:
  // nobody has answered about that operator yet, which is an answer, not a
  // failed read. Any other 404, such as a proxy's page for a wrong node URL,
  // is a failed read.
  if (res.status === 404) {
    const body: unknown = await res.json().catch(() => null);
    if ((body as { errorNum?: unknown } | null)?.errorNum === 10) return {};
  }
  if (!res.ok) throw new Error(`The node answered ${res.status}`);
  return (await res.json()) as InboundResponse;
}

/** The operator's current Interfold answers, read from the node. */
export async function readEvidence(
  nodeUrl: string,
  operator: string,
  fetchJson = fetchInbound,
): Promise<LiveAnswer[]> {
  return interfoldEvidence(await fetchJson(nodeUrl, operator));
}

/** Which part of the evidence screen to show for a read in this state. */
export function evidenceView(read: {
  loading: boolean;
  error: unknown;
}): 'loading' | 'error' | 'answers' {
  // Loading first: Solid keeps a resource's last error while it loads again,
  // so checking the error first would leave a stale error card up during a
  // retry or while another operator loads.
  if (read.loading) return 'loading';
  if (read.error) return 'error';
  return 'answers';
}
