import { useParams } from '@solidjs/router';
import { For, Match, Show, Switch, createSignal } from 'solid-js';
import { readCoreSession } from '@aura/domain/core-session';
import { Back } from '@/components';
import { LIVE, isOperatorId } from '@/live/config';
import { LiveAnswer, answerGate } from '@/live/writer';
import { Q, QUESTIONS, QUESTION_TEXT } from '@/model/questions';

const STATE_TEXT = {
  holding: 'Sending soon',
  submitting: 'Sending',
  submitted: 'Sent; waiting for the node to apply it',
  unconfirmed: 'Sent; the node has not confirmed it yet',
  applied: 'Applied by the node',
  failed: 'Not applied',
} as const;

/** Answer the three Interfold questions about one operator on the node (not a practice persona), as the apps/core user. */
export default function LiveAnswerScreen() {
  const params = useParams();
  const operator = () => params.operator ?? '';
  // Read once per page view: whoever is signed in to apps/core in this browser.
  // Each answer is signed only as this account (the writer's `evaluator`), so
  // signing in as someone else in another tab fails an answer instead of
  // switching who signs it.
  const session = readCoreSession();
  return (
    <>
      <Back to="/" />
      <h1 class="a-head" data-level="2">
        Answer about an operator
      </h1>
      <p class="a-text break-all" data-variant="small">
        Operator · {operator()}
      </p>
      <Switch>
        <Match
          when={answerGate(session, operator(), isOperatorId) === 'invalid'}
        >
          <p class="a-text">
            This link is not valid: it does not name a BrightID.
          </p>
        </Match>
        <Match
          when={answerGate(session, operator(), isOperatorId) === 'signed-out'}
        >
          <p class="a-text">
            Sign in to Aura first: your answers are signed with your Aura login.
          </p>
          <a class="a-button self-start" href="/core/">
            Sign in to Aura
          </a>
        </Match>
        <Match when={session}>
          {(me) => (
            <>
              <p class="a-text" data-variant="muted">
                Answering as {me().brightId}, sent to {LIVE.nodeUrl}.
              </p>
              <For each={QUESTIONS}>
                {(q) => (
                  <Question
                    operator={operator()}
                    question={q}
                    evaluator={me().brightId}
                  />
                )}
              </For>
            </>
          )}
        </Match>
      </Switch>
    </>
  );
}

function Question(props: {
  operator: string;
  question: number;
  evaluator: string;
}) {
  const [confidence, setConfidence] = createSignal(2);
  const [sent, setSent] = createSignal<LiveAnswer>();
  const answer = (yes: boolean) =>
    setSent(
      new LiveAnswer(
        {
          operator: props.operator,
          question: props.question,
          yes,
          confidence: confidence(),
        },
        {
          nodeUrl: LIVE.nodeUrl,
          session: readCoreSession,
          evaluator: props.evaluator,
        },
      ),
    );
  const busy = () => {
    const s = sent()?.state;
    return (
      s === 'holding' ||
      s === 'submitting' ||
      s === 'submitted' ||
      s === 'unconfirmed'
    );
  };
  return (
    <section class="a-card flex flex-col gap-2" data-variant="default">
      <span class="font-medium">{Q[props.question]}</span>
      <p class="a-text" data-variant="small">
        {QUESTION_TEXT[props.question]}
      </p>
      <label class="a-text flex items-center gap-2" data-variant="small">
        Confidence
        <select
          value={confidence()}
          disabled={busy()}
          onChange={(e) => setConfidence(Number(e.currentTarget.value))}
        >
          <For each={[1, 2, 3, 4]}>{(c) => <option value={c}>{c}</option>}</For>
        </select>
      </label>
      <div class="flex gap-2">
        <button
          class="a-button"
          data-size="sm"
          disabled={busy()}
          onClick={() => answer(true)}
        >
          Yes
        </button>
        <button
          class="a-button"
          data-size="sm"
          disabled={busy()}
          onClick={() => answer(false)}
        >
          No
        </button>
      </div>
      <Show when={sent()}>
        {(a) => (
          <div class="flex items-center gap-2">
            <span class="text-sm">
              {a().answer.yes ? 'Yes' : 'No'} · {STATE_TEXT[a().state]}
              <Show when={a().state === 'failed' && a().error}>
                : {a().error}
              </Show>
            </span>
            <Show when={a().state === 'holding'}>
              <button
                class="a-button"
                data-variant="ghost"
                data-size="sm"
                onClick={() => a().undo()}
              >
                Undo
              </button>
            </Show>
            <Show when={a().state === 'unconfirmed'}>
              <button
                class="a-button"
                data-variant="ghost"
                data-size="sm"
                onClick={() => a().checkAgain()}
              >
                Check again
              </button>
            </Show>
            <Show when={a().state === 'failed' && a().error !== 'Undone'}>
              <button
                class="a-button"
                data-variant="ghost"
                data-size="sm"
                onClick={() => a().retry()}
              >
                Retry
              </button>
            </Show>
          </div>
        )}
      </Show>
    </section>
  );
}
