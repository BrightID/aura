import { createSignal } from 'solid-js';
import { b64ToUint8Array, hash } from '@aura/domain/crypto';
import { HttpError, isNotFound } from '@aura/domain/http';
import type { CoreSession } from '@aura/domain/core-session';
import {
  buildEvaluateOperation,
  fetchOperation,
  postOperation,
  type InterfoldCategory,
  type OperationStatus,
} from '@aura/domain/operations';
import { EvaluationValue } from '@aura/domain/types/evaluations';
import { Q } from '@/model/questions';

export type LiveState =
  | 'holding'
  | 'submitting'
  | 'submitted'
  | 'unconfirmed'
  | 'applied'
  | 'failed';

/** One Yes or No answer to one question, as the answer screen gives it. */
export interface LiveAnswerInput {
  operator: string;
  /** 0, 1 or 2: the question's index in `Q`, the three Interfold questions in order. */
  question: number;
  yes: boolean;
  /** An integer from 1 to 4. */
  confidence: number;
}

/** The category question 0, 1 or 2 is sent as. Throws for any other number. */
export function questionCategory(question: number): InterfoldCategory {
  const category = Number.isInteger(question) ? Q[question] : undefined;
  if (!category) throw new Error(`No Interfold question ${question}`);
  return category;
}

/**
 * The signed Evaluate operation (the node's operation for an evaluation) for
 * an answer, signed with `session`'s key. Callers pass the apps/core session.
 * Throws on a bad question index or confidence.
 */
export function signAnswer(
  answer: LiveAnswerInput,
  session: CoreSession,
  timestamp: number,
) {
  const category = questionCategory(answer.question);
  if (
    !Number.isInteger(answer.confidence) ||
    answer.confidence < 1 ||
    answer.confidence > 4
  )
    throw new Error(
      `Confidence must be an integer from 1 to 4, not ${answer.confidence}`,
    );
  return buildEvaluateOperation({
    domain: 'Interfold',
    category,
    evaluator: session.brightId,
    evaluated: answer.operator,
    evaluation: answer.yes
      ? EvaluationValue.POSITIVE
      : EvaluationValue.NEGATIVE,
    confidence: answer.confidence,
    timestamp,
    secretKey: b64ToUint8Array(session.secretKey),
  });
}

/** What a live answer needs from outside; tests pass their own. */
export interface WriterDeps {
  nodeUrl: string;
  /** The signed-in core user at the moment the answer is signed. */
  session: () => CoreSession | null;
  /**
   * The BrightID the screen shows as answering. When set, signing as anyone
   * else fails the answer; left empty, no check runs, so the screen always sets it.
   */
  evaluator?: string;
  now?: () => number;
  post?: typeof postOperation;
  state?: (nodeUrl: string, hash: string) => Promise<OperationStatus>;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (timer: unknown) => void;
}

export const UNDO_MS = 1500;
export const POLL_MS = 5_000;
export const SETTLE_MS = 5 * 60_000;
/**
 * ArangoDB's write-conflict error, the one failure the node retries by itself;
 * on it the writer keeps polling instead of failing the answer.
 */
export const ARANGO_CONFLICT = 1200;
/** The node's error for an operation it already applied (OperationAppliedBeforeError). */
export const APPLIED_BEFORE = 25;

/**
 * The message postOperation's error has when the node returns a hash that is
 * not the signed message's. submit() throws the same message when a `post` in
 * WriterDeps returns another hash, and matches on it to fail the answer; keep
 * it equal to postOperation's, or a mismatch would be polled instead of failed.
 */
const HASH_MISMATCH = 'Invalid operation hash returned from server';

/**
 * One poll of the node: a status, `'not found'` for a 404, or undefined when
 * the request failed in any other way (no response, a timeout, a 5xx).
 */
type Poll = OperationStatus | 'not found' | undefined;

/** Whether a status the node reported settles an answer, and how. */
function settle(status: OperationStatus): 'applied' | 'failed' | 'pending' {
  const { state } = status;
  // Failed with errorNum 25 means the node processed this answer's operation a
  // second time, as when the node's receiver (the process that applies the
  // blocks of operations) reprocesses a block, and overwrote the stored applied
  // state with failed. The evaluation is already stored.
  // Failed with the write conflict, 1200, is still pending: the receiver
  // retries that operation at once by itself.
  if (
    state === 'APPLIED' ||
    (state === 'FAILED' && status.errorNum === APPLIED_BEFORE)
  )
    return 'applied';
  if (
    state === 'EXPIRED' ||
    (state === 'FAILED' && status.arangoErrorNum !== ARANGO_CONFLICT)
  )
    return 'failed';
  return 'pending';
}

/**
 * One live answer. It holds for the 1.5-second undo window; undo() during the
 * window moves it to `failed` with the error 'Undone'. Otherwise it is signed
 * and posted (`submitting`), and from then on it is tracked by the hash of the
 * signed message.
 *
 * It fails before posting when there is no session, or, when
 * `deps.evaluator` is set, a session for an account other than that one. It fails when the
 * node refuses the post with a 4xx status or returns another hash. Any other
 * post failure (no response, a network error, a 5xx) may come after the node
 * stored the operation, so the answer polls its hash as if the post had
 * succeeded.
 *
 * Once submitted, it polls the node every 5 seconds until `settle` says the
 * answer is applied or failed. A poll that gets a 404 or fails in any other
 * way settles nothing. If nothing settles it within 5 minutes, it is
 * `unconfirmed`: still pending, and the screen's Check again calls
 * checkAgain(), which polls for another 5 minutes. Each 5-minute window is
 * judged on its own: when at least one of its polls got a 404 and none got
 * an operation state (polls with no response count for neither), the node
 * holds no such operation, and the answer is `failed` instead.
 *
 * A failed answer can be retried, except one that was undone. A retry first
 * polls the hash it last posted, since the node can still apply an operation
 * it reported failed. That operation applied makes the answer `applied`;
 * still pending, the answer polls it again. On a 404, `EXPIRED`, or a
 * `FAILED` that `settle` treats as final, the answer is signed again, with
 * the Yes or No and confidence the retry was given, and posted. When that
 * poll gets no response, the answer stays `failed` with nothing signed. dispose() cancels the timer, so a holding
 * answer is never posted and polling ends.
 */
export class LiveAnswer {
  error?: string;
  private readonly deps: Required<WriterDeps>;
  private readonly signal = createSignal<LiveState>('holding');
  private readonly input: ReturnType<typeof createSignal<LiveAnswerInput>>;
  private timer?: unknown;
  private run = 0;
  private hash?: string;

  constructor(answer: LiveAnswerInput, deps: WriterDeps) {
    this.input = createSignal(answer);
    this.deps = {
      now: Date.now,
      post: postOperation,
      state: fetchOperation,
      setTimer: (fn, ms) => setTimeout(fn, ms),
      clearTimer: (t) => clearTimeout(t as ReturnType<typeof setTimeout>),
      evaluator: '',
      ...deps,
    };
    this.timer = this.deps.setTimer(() => void this.submit(), UNDO_MS);
  }

  get state() {
    return this.signal[0]();
  }

  /** The answer last signed, or to be signed; a retry may change its Yes or No and confidence. */
  get answer() {
    return this.input[0]();
  }

  /**
   * Whether this answer has sent a post. Even a post the node refused may be
   * checked before another is signed, as a retry does for every post.
   */
  get posted() {
    return this.hash !== undefined;
  }

  /** Cancel while holding; nothing is sent. Returns false once it has left holding. */
  undo() {
    if (this.state !== 'holding') return false;
    this.stop();
    this.fail('Undone');
    return true;
  }

  /**
   * Cancel the pending timer, as when the screen closes: a holding answer is
   * never posted, and polling ends. An answer already posted stays on the node.
   * Nothing restarts it unless retry() or checkAgain() is called.
   */
  dispose() {
    this.stop();
  }

  /** Poll an unconfirmed answer again, for another 5 minutes. */
  checkAgain() {
    if (this.state === 'unconfirmed' && this.hash)
      this.watch(this.hash, ++this.run);
  }

  /**
   * For a failed answer that was not undone: poll the last post, if there
   * was one, and sign and post again unless that post is applied or pending
   * or the poll gets no response. What is signed is the answer with `change`
   * applied: the screen passes the confidence selected now, and, when the
   * person pressed Yes or No rather than Retry, that value. When nothing is
   * signed, `change` is dropped.
   */
  retry(change: Partial<Pick<LiveAnswerInput, 'yes' | 'confidence'>> = {}) {
    if (this.state === 'failed' && this.error !== 'Undone')
      void this.submit(change);
  }

  private stop() {
    this.deps.clearTimer(this.timer);
    this.run++;
  }

  private fail(error: string) {
    this.error = error;
    this.signal[1]('failed');
  }

  private async poll(hash: string): Promise<Poll> {
    try {
      return await this.deps.state(this.deps.nodeUrl, hash);
    } catch (e) {
      return isNotFound(e) ? 'not found' : undefined;
    }
  }

  private async submit(
    change: Partial<Pick<LiveAnswerInput, 'yes' | 'confidence'>> = {},
  ) {
    const run = ++this.run;
    this.error = undefined;
    this.signal[1]('submitting');
    if (this.hash) {
      const earlier = await this.poll(this.hash);
      if (run !== this.run) return;
      if (earlier === undefined)
        return this.fail(
          'Could not reach the node to check the earlier answer; try again',
        );
      if (earlier !== 'not found') {
        const settled = settle(earlier);
        if (settled === 'applied') return void this.signal[1]('applied');
        if (settled === 'pending') return this.watch(this.hash, run);
      }
    }
    // `answer`, which the screen shows, takes the change only once it is
    // signed: until then, the earlier answer is the one the node may still
    // apply.
    const next = { ...this.answer, ...change };
    let signed: ReturnType<typeof signAnswer>;
    try {
      const session = this.deps.session();
      if (!session) throw new Error('Sign in to Aura first');
      if (this.deps.evaluator && session.brightId !== this.deps.evaluator)
        throw new Error(
          'You are now signed in to Aura with another account; reload this page',
        );
      signed = signAnswer(next, session, this.deps.now());
    } catch (e) {
      return this.fail(e instanceof Error ? e.message : String(e));
    }
    this.input[1](next);
    const ownHash = hash(signed.message);
    this.hash = ownHash;
    try {
      const returned = await this.deps.post(
        this.deps.nodeUrl,
        signed.op,
        signed.message,
      );
      if (returned !== ownHash) throw new Error(HASH_MISMATCH);
    } catch (e) {
      if (run !== this.run) return;
      // The node refuses with a 4xx only before it stores an operation, and a
      // hash that differs is not this answer's operation, so neither is worth
      // polling. Signing errors never reach here: that try returned above.
      if (
        (e instanceof HttpError && e.status < 500) ||
        (e instanceof Error && e.message === HASH_MISMATCH)
      )
        return this.fail(e.message);
    }
    if (run !== this.run) return;
    this.watch(ownHash, run);
  }

  private watch(hash: string, run: number) {
    this.signal[1]('submitted');
    const until = this.deps.now() + SETTLE_MS;
    let notFound = false;
    let found = false;
    const tick = async () => {
      if (run !== this.run) return;
      const status = await this.poll(hash);
      if (run !== this.run) return;
      if (status === 'not found') notFound = true;
      else if (status) {
        found = true;
        const settled = settle(status);
        if (settled === 'applied') return void this.signal[1]('applied');
        if (settled === 'failed')
          return this.fail(`The node reported ${status.state.toLowerCase()}`);
      }
      if (this.deps.now() >= until) {
        if (notFound && !found)
          return this.fail('The node has no record of this answer');
        return void this.signal[1]('unconfirmed');
      }
      this.timer = this.deps.setTimer(() => void tick(), POLL_MS);
    };
    this.timer = this.deps.setTimer(() => void tick(), POLL_MS);
  }
}

/**
 * What a Yes or No on a question does, given the question's last answer:
 * nothing while that answer is in flight; a retry of it, with the new value,
 * when it failed after a post the node may still apply; otherwise a new answer.
 */
export function answerAction(last?: LiveAnswer): 'none' | 'retry' | 'new' {
  const s = last?.state;
  if (
    s === 'holding' ||
    s === 'submitting' ||
    s === 'submitted' ||
    s === 'unconfirmed'
  )
    return 'none';
  return s === 'failed' && last!.posted ? 'retry' : 'new';
}

/** What the answer screen can offer, before any answer is given. */
export function answerGate(
  session: CoreSession | null,
  operator: string,
  isOperatorId: (id: string) => boolean,
): 'invalid' | 'signed-out' | 'ready' {
  if (!isOperatorId(operator)) return 'invalid';
  return session ? 'ready' : 'signed-out';
}
