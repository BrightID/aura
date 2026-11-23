import { createSignal } from 'solid-js';
import { b64ToUint8Array } from '@aura/domain/crypto';
import type { CoreSession } from '@aura/domain/core-session';
import {
  buildEvaluateOperation,
  fetchOperationState,
  postOperation,
  type InterfoldCategory,
} from '@aura/domain/operations';
import {
  EvaluationValue,
  type OperationState,
} from '@aura/domain/types/evaluations';
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
  state?: (nodeUrl: string, hash: string) => Promise<OperationState>;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (timer: unknown) => void;
}

export const UNDO_MS = 1500;
export const POLL_MS = 5_000;
export const SETTLE_MS = 5 * 60_000;

/**
 * One live answer. It holds for the undo window, then is signed and posted
 * (`submitting`). It is `submitted` once the node returns a hash equal to the
 * signed message's hash, and `failed` if signing or posting fails: no session,
 * another account, a hash that differs, or a post error.
 *
 * Once submitted, it is `applied` when the node reports applied, and `failed`
 * when the node reports expired or reports failed on two polls in a row. One
 * failed report is not enough, because on a write conflict the node stores
 * failed, then retries the same operation and may apply it. After 5 minutes
 * without applied or failed, it is `unconfirmed`: still pending, and it can be
 * checked again. A failed answer can be retried, except one that was undone.
 */
export class LiveAnswer {
  readonly answer: LiveAnswerInput;
  error?: string;
  private readonly deps: Required<WriterDeps>;
  private readonly signal = createSignal<LiveState>('holding');
  private timer?: unknown;
  private run = 0;
  private hash?: string;

  constructor(answer: LiveAnswerInput, deps: WriterDeps) {
    this.answer = answer;
    this.deps = {
      now: Date.now,
      post: postOperation,
      state: fetchOperationState,
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

  /** Cancel while holding; nothing is sent. Returns false once it has left holding. */
  undo() {
    if (this.state !== 'holding') return false;
    this.deps.clearTimer(this.timer);
    this.run++;
    this.fail('Undone');
    return true;
  }

  /** Poll an unconfirmed answer again, for another 5 minutes. */
  checkAgain() {
    if (this.state === 'unconfirmed' && this.hash)
      this.watch(this.hash, ++this.run);
  }

  /** Sign and send a failed answer again. */
  retry() {
    if (this.state === 'failed' && this.error !== 'Undone') void this.submit();
  }

  private fail(error: string) {
    this.error = error;
    this.signal[1]('failed');
  }

  private async submit() {
    const run = ++this.run;
    this.error = undefined;
    this.signal[1]('submitting');
    let hash: string;
    try {
      const session = this.deps.session();
      if (!session) throw new Error('Sign in to Aura first');
      if (this.deps.evaluator && session.brightId !== this.deps.evaluator)
        throw new Error(
          'You are now signed in to Aura with another account; reload this page',
        );
      const { op, message } = signAnswer(this.answer, session, this.deps.now());
      hash = await this.deps.post(this.deps.nodeUrl, op, message);
    } catch (e) {
      if (run === this.run)
        this.fail(e instanceof Error ? e.message : String(e));
      return;
    }
    if (run !== this.run) return;
    this.hash = hash;
    this.watch(hash, run);
  }

  private watch(hash: string, run: number) {
    this.signal[1]('submitted');
    const until = this.deps.now() + SETTLE_MS;
    let failedOnce = false;
    const poll = async () => {
      if (run !== this.run) return;
      let state: OperationState | undefined;
      try {
        state = await this.deps.state(this.deps.nodeUrl, hash);
      } catch {
        // A poll request that throws counts as no report: polling goes on at
        // the next POLL_MS, and the time still counts toward the 5 minutes.
      }
      if (run !== this.run) return;
      if (state === 'APPLIED') return void this.signal[1]('applied');
      if (state === 'EXPIRED' || (state === 'FAILED' && failedOnce))
        return this.fail(`The node reported ${state.toLowerCase()}`);
      failedOnce = state === 'FAILED';
      if (this.deps.now() >= until) return void this.signal[1]('unconfirmed');
      this.timer = this.deps.setTimer(() => void poll(), POLL_MS);
    };
    this.timer = this.deps.setTimer(() => void poll(), POLL_MS);
  }
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
