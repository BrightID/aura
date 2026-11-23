import { useParams } from '@solidjs/router';
import { For, Match, Switch, createResource } from 'solid-js';
import { Back } from '@/components';
import { LIVE, isOperatorId } from '@/live/config';
import { evidenceView, readEvidence } from '@/live/evidence';

/** The Interfold answers the node holds about one operator. */
export default function LiveEvidence() {
  const params = useParams();
  const operator = () => params.operator ?? '';
  const [answers, { refetch }] = createResource(
    () => (isOperatorId(operator()) ? operator() : false),
    (id) => readEvidence(LIVE.nodeUrl, id),
  );
  return (
    <>
      <Back to="/" />
      <h1 class="a-head" data-level="2">
        Interfold answers
      </h1>
      <p class="a-text break-all" data-variant="small">
        Operator · {operator()}
      </p>
      <Switch>
        <Match when={!isOperatorId(operator())}>
          <p class="a-text">
            This link is not valid: it does not name a BrightID.
          </p>
        </Match>
        <Match when={evidenceView(answers) === 'error'}>
          <section class="a-card flex flex-col gap-2" data-variant="default">
            <p class="a-text">
              Could not read the answers from {LIVE.nodeUrl}.
            </p>
            <button
              class="a-button self-start"
              data-size="sm"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </section>
        </Match>
        <Match when={evidenceView(answers) === 'loading'}>
          <p class="a-text" data-variant="muted">
            Reading…
          </p>
        </Match>
        <Match when={answers()}>
          {(list) => (
            <>
              <p class="a-text" data-variant="small">
                Admission is not determined: no rule for admitting an operator
                has been accepted.
              </p>
              <p class="a-text" data-variant="muted">
                Records returned by {LIVE.nodeUrl}. They carry no signatures
                that this page checks.
              </p>
              <section
                class="a-card flex flex-col gap-2"
                data-variant="default"
              >
                <For
                  each={list()}
                  fallback={<p class="a-text">No Interfold answers yet.</p>}
                >
                  {(a) => (
                    <div class="flex flex-col">
                      <span class="font-medium">
                        {a.question} · {a.yes ? 'Yes' : 'No'} · confidence{' '}
                        {a.confidence}
                      </span>
                      <span class="a-text break-all" data-variant="small">
                        {a.evaluator} ·{' '}
                        <time datetime={new Date(a.modified).toISOString()}>
                          {new Date(a.modified).toLocaleString()}
                        </time>
                      </span>
                    </div>
                  )}
                </For>
              </section>
            </>
          )}
        </Match>
      </Switch>
    </>
  );
}
