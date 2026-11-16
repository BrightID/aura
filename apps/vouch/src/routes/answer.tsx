import { useNavigate, useParams } from '@solidjs/router';
import { For, Show, createSignal } from 'solid-js';
import { answerKey, useApp } from '@/app';
import {
  Ago,
  AnswerControl,
  Back,
  Chip,
  DoneState,
  Row,
  VoteCell,
  VoteList,
} from '@/components';
import { deriveHistory, deriveStatus, votes } from '@/model/derive';
import {
  Q,
  QUESTIONS,
  QUESTION_TEXT,
  SHORT_QUESTION_TEXT,
} from '@/model/questions';
import {
  answerPath,
  answeredAll,
  canRate,
  label,
  nextIncoming,
  type AnswerKind,
} from '@/model/view';

type RoleKind = Exclude<AnswerKind, 'question'>;

const NOT_ALLOWED: Record<RoleKind, [string, string]> = {
  player: ['Rate as player', 'Only trainers can rate players in.'],
  trainer: ['Rate as trainer', 'Only managers can rate trainers.'],
  manager: ['Rate as manager', 'Only managers can answer manager asks.'],
};

/** Answer a request: the three operator questions, or one role question. */
export default function Answer() {
  const params = useParams();
  const { api } = useApp();
  const role = () =>
    (['player', 'trainer', 'manager'] as const).find((x) => x === params.role);
  return (
    <Show when={role()} fallback={<Questions k={params.subject!} />} keyed>
      {(kind) => (
        <Show
          when={canRate(api, api.state.persona, kind)}
          fallback={
            <>
              <h1 class="a-head" data-level="2">
                {NOT_ALLOWED[kind][0]}
              </h1>
              <p class="a-text">{NOT_ALLOWED[kind][1]}</p>
            </>
          }
        >
          <Back />
          <h1 class="a-head" data-level="2">
            Rate {label(api, params.subject!)} as{' '}
            {kind === 'player' ? 'a player' : kind}
          </h1>
          <section class="a-card flex flex-col gap-2" data-variant="default">
            <Show when={kind === 'player'}>
              <span class="font-medium">
                {label(api, params.subject!)} · Wants to be a player
              </span>
            </Show>
            <p class="a-text">
              Should {label(api, params.subject!)} be a {kind}?
            </p>
            <AnswerControl kind={kind} subject={params.subject!} />
          </section>
        </Show>
      )}
    </Show>
  );
}

function Questions(props: { k: string }) {
  const app = useApp();
  const { api, href } = app;
  const navigate = useNavigate();
  const p = () => api.state.persona;
  const profile = () => api.disclosure.get(props.k);
  const subject = () => api.getVerifications(props.k).categories.subject?.level;
  const complete = () =>
    answeredAll(api, p(), props.k) &&
    !QUESTIONS.some(
      (q) => app.pendingAnswers[answerKey(p(), 'question', props.k, q)],
    );
  const next = () => nextIncoming(api, p(), props.k);
  const count = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;
  return (
    <Show
      when={canRate(api, p(), 'question')}
      fallback={
        <>
          <h1 class="a-head" data-level="2">
            Answer
          </h1>
          <p class="a-text">Only players can answer Interfold questions.</p>
        </>
      }
    >
      <Back />
      <h1 class="a-head" data-level="2">
        Answer {label(api, props.k)}
      </h1>
      <p class="flex flex-wrap items-center gap-1">
        <Chip status={deriveStatus(api, props.k)} /> ·{' '}
        <Chip
          status={subject() ? `Unique · L${subject()}` : 'Not verified unique'}
        />
      </p>
      <p class="a-text" data-variant="muted">
        Tap again to raise confidence. Hold for a stronger answer.
      </p>
      <details>
        <summary class="cursor-pointer">
          {count(profile().nodes.length, 'node', 'nodes')} · shares control with{' '}
          {profile().controlRelationships.length
            ? count(
                profile().controlRelationships.length,
                'operator',
                'operators',
              )
            : 'no one'}
        </summary>
        <div class="flex flex-col gap-1 pt-2">
          <h3 class="a-head" data-level="6">
            Nodes I run
          </h3>
          <For each={profile().nodes} fallback={<p>None</p>}>
            {(node, i) => <Row title={`Node ${i() + 1}`} sub={node.location} />}
          </For>
          <h3 class="a-head" data-level="6">
            Operators I share control with
          </h3>
          <For each={profile().controlRelationships} fallback={<p>None</p>}>
            {(id) => (
              <Row
                title={label(api, id)}
                sub="Shares control with this operator"
              />
            )}
          </For>
        </div>
      </details>
      <For each={QUESTIONS}>
        {(q) => {
          const [open, setOpen] = createSignal(false);
          return (
            <section
              class="a-card flex flex-col gap-2"
              data-variant="default"
              role="group"
              aria-label={QUESTION_TEXT[q]}
            >
              <div class="flex items-center justify-between">
                <span class="font-medium">{Q[q]}</span>
                <button
                  type="button"
                  class="a-button"
                  data-variant="ghost"
                  data-size="sm"
                  aria-expanded={open()}
                  aria-label={`Show ${Q[q]} answers`}
                  onClick={() => setOpen(!open())}
                >
                  <VoteCell votes={votes(api, props.k, q)} />
                </button>
              </div>
              <Show when={open()}>
                <VoteList votes={votes(api, props.k, q)} />
              </Show>
              <p class="a-text">{SHORT_QUESTION_TEXT[q]}</p>
              <details>
                <summary class="cursor-pointer text-sm">How to decide</summary>
                <p class="a-text" data-variant="small">
                  {QUESTION_TEXT[q]}
                </p>
                <Show when={q === 2}>
                  <p class="a-text" data-variant="small">
                    Count relationships involving shared ownership or funding,
                    node administration, key access, infrastructure that creates
                    practical control, or deliberate coordination of threshold
                    activity. Do not count friendship, discussion or advice
                    about running nodes, common DAO membership, or participation
                    in the same community by themselves.
                  </p>
                </Show>
              </details>
              <AnswerControl kind="question" subject={props.k} question={q} />
            </section>
          );
        }}
      </For>
      <div aria-live="polite">
        <Show when={complete()}>
          <DoneState
            title={`✓ All ${Q.length} answered`}
            next={next() ? 'Next request →' : 'Back to Requests'}
            onNext={() => {
              const row = next();
              navigate(
                href(
                  row && row.type !== 'player' ? answerPath(row) : '/requests',
                ),
              );
            }}
          />
        </Show>
      </div>
    </Show>
  );
}

/** A read-only view of the answers given to someone earlier. */
export function PastAnswer() {
  const params = useParams();
  const { api, href } = useApp();
  const navigate = useNavigate();
  const row = () =>
    deriveHistory(api, api.state.persona).find(
      (x) => x.subject === params.subject!,
    );
  return (
    <>
      <Back />
      <h1 class="a-head" data-level="2">
        Earlier answers · {label(api, params.subject!)}
      </h1>
      <section class="a-card flex flex-col gap-2" data-variant="default">
        <For each={row()?.answers ?? []}>
          {(a) => (
            <Row
              title={
                !a.role || a.role === 'subject'
                  ? Q[a.question]
                  : a.role[0].toUpperCase() + a.role.slice(1)
              }
              tail={
                <span data-state={a.yes ? 'good' : 'bad'}>
                  {a.yes ? 'Yes' : 'No'} · confidence {a.conf}
                </span>
              }
              sub={
                <>
                  {a.edited ? 'Edited · ' : ''}
                  <Ago time={a.time} />
                </>
              }
            />
          )}
        </For>
      </section>
      <button
        type="button"
        class="a-button self-start"
        onClick={() =>
          navigate(
            href(
              `/answer/${encodeURIComponent(params.subject!)}${params.role ? '/' + params.role : ''}`,
            ),
          )
        }
      >
        Edit
      </button>
    </>
  );
}
