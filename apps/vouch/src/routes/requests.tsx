import { For, Show, type JSX } from 'solid-js';
import { useApp } from '@/app';
import {
  Ago,
  AnswerControl,
  Chip,
  RoleWord,
  Row,
  VoteCell,
} from '@/components';
import { deriveHistory, deriveRequestQueue, votes } from '@/model/derive';
import { QUESTIONS } from '@/model/questions';
import {
  ago,
  answerMark,
  answerPath,
  canRate,
  historyRole,
  label,
  ownAnswer,
  sentAsks,
  sentKindName,
  type SentKind,
} from '@/model/view';

const Group = (props: {
  title: string;
  count: number;
  children: JSX.Element;
}) => (
  <details open class="flex flex-col gap-2">
    <summary class="a-head cursor-pointer" data-level="5">
      {props.title} · {props.count}
    </summary>
    <div class="flex flex-col gap-3 pt-2">{props.children}</div>
  </details>
);

export default function Requests() {
  const { api } = useApp();
  return (
    <>
      <h1 class="a-head" data-level="2">
        Requests
      </h1>
      <Show
        when={api.state.persona !== 'newcomer'}
        fallback={
          <p class="a-text">Pick a person in Practice to see their requests.</p>
        }
      >
        <Queue p={api.state.persona} />
      </Show>
    </>
  );
}

function Queue(props: { p: string }) {
  const { api, href } = useApp();
  const queue = () => deriveRequestQueue(api, props.p);
  const operators = () => queue().incoming.filter((x) => x.type !== 'manager');
  const managers = () => queue().incoming.filter((x) => x.type === 'manager');
  const waitingOnYou = () =>
    queue().incoming.length + queue().player.length + queue().trainer.length;
  const sent = () => sentAsks(api, props.p);
  const sentKinds = () => [...new Set(sent().open.map((x) => x.request))];
  const history = () => deriveHistory(api, props.p);
  const answeredCount = () =>
    history().length + sent().finishedRoleAsks.length + sent().finished.length;
  const askee = (to: string) =>
    to === 'team'
      ? 'Interfold team'
      : to.startsWith('link:')
        ? 'Someone you sent a link to'
        : label(api, to);
  const roleAnswer = (kind: SentKind, to: string) =>
    api.state.answers.find(
      (a) =>
        a.domain === 'interfold' &&
        a.subject === props.p &&
        a.rater === to &&
        a.role === kind,
    );

  // The Player and Trainer loops key rows by sender id, not by row object:
  // deriveRequestQueue builds new objects on every state change, and a rebuilt
  // row would drop a Yes or No that is being held down.
  return (
    <>
      <section class="flex flex-col gap-1">
        <h2 class="a-head" data-level="4">
          Waiting on you · {waitingOnYou()}
        </h2>
        <Show when={!waitingOnYou()}>
          <p class="a-text" data-variant="muted">
            Nothing waiting on you.
          </p>
        </Show>
      </section>
      <Show when={queue().player.length}>
        <Group title="Player asks" count={queue().player.length}>
          <For each={queue().player.map((x) => x.from)}>
            {(from) => (
              <div class="flex flex-col gap-2">
                <Row
                  title={label(api, from)}
                  sub={
                    <>
                      Wants to be a <RoleWord role="player">player</RoleWord> ·
                      1 question ·{' '}
                      <Ago
                        time={queue().player.find((x) => x.from === from)?.time}
                      />
                    </>
                  }
                />
                <Show
                  when={canRate(api, props.p, 'player')}
                  fallback={
                    <p class="a-text" data-variant="muted">
                      Only trainers can rate players in.
                    </p>
                  }
                >
                  <p class="a-text">Should this person be a player?</p>
                  <AnswerControl kind="player" subject={from} />
                </Show>
              </div>
            )}
          </For>
        </Group>
      </Show>
      <Show when={queue().trainer.length}>
        <Group title="Trainer asks" count={queue().trainer.length}>
          <For
            each={[...queue().trainer]
              .sort((a, b) => b.time.localeCompare(a.time))
              .map((x) => x.from)}
          >
            {(from) => (
              <div class="flex flex-col gap-2">
                <Row
                  title={label(api, from)}
                  tail={
                    ownAnswer(api, props.p, 'trainer', from, 0) && (
                      <Chip status="Answered" />
                    )
                  }
                  sub={
                    <>
                      Wants to be a <RoleWord role="trainer">trainer</RoleWord>{' '}
                      ·{' '}
                      <Ago
                        time={
                          queue().trainer.find((x) => x.from === from)?.time
                        }
                      />
                    </>
                  }
                />
                <p class="a-text">Should this person be a trainer?</p>
                <AnswerControl kind="trainer" subject={from} />
              </div>
            )}
          </For>
        </Group>
      </Show>
      <Show when={managers().length}>
        <Group title="Manager asks" count={managers().length}>
          <For each={managers()}>
            {(x) => (
              <Row
                href={href(answerPath(x))}
                title={label(api, x.from)}
                tail={<Chip status={x.status} />}
                sub={
                  <>
                    Wants to be a <RoleWord role="manager">manager</RoleWord> ·{' '}
                    <Ago time={x.time} />
                  </>
                }
              />
            )}
          </For>
        </Group>
      </Show>
      <Show when={operators().length}>
        <Group title="Node operator questions" count={operators().length}>
          <For each={operators()}>
            {(x) => {
              const subject = () =>
                api.getVerifications(x.from).categories.subject?.level;
              return (
                <Row
                  href={href(answerPath(x))}
                  title={label(api, x.from)}
                  tail={
                    <>
                      <Chip status={x.status} />
                      <span aria-hidden="true">›</span>
                    </>
                  }
                  sub={
                    <span class="flex flex-wrap items-center gap-1">
                      Asked you · 3 questions · <Ago time={x.time} />
                      <span
                        class="inline-flex gap-1"
                        aria-label="Answers for keyholder, self-custody and disclosure"
                      >
                        <For each={QUESTIONS}>
                          {(q) => <VoteCell votes={votes(api, x.from, q)} />}
                        </For>
                      </span>
                      <Chip
                        status={
                          subject()
                            ? `Unique · L${subject()}`
                            : 'Not verified unique'
                        }
                      />
                    </span>
                  }
                />
              );
            }}
          </For>
        </Group>
      </Show>
      <section class="flex flex-col gap-2">
        <h2 class="a-head" data-level="4">
          Waiting on others · {sent().open.length}
        </h2>
        <div class="a-card flex flex-col gap-2" data-variant="default">
          <For
            each={sentKinds()}
            fallback={
              <p class="a-text" data-variant="muted">
                Nothing waiting on others.
              </p>
            }
          >
            {(kind) => {
              const asks = () => sent().open.filter((x) => x.request === kind);
              const title = `${sentKindName(kind)} ask`;
              return (
                <Group title={title} count={asks().length}>
                  <p class="a-text" data-variant="muted">
                    {asks().filter((x) => x.answered === 'Yes').length} of{' '}
                    {asks().length} Yes
                  </p>
                  <For each={asks()}>
                    {(x) => (
                      <Row
                        title={askee(x.to)}
                        tail={<Chip status={x.answered} />}
                        sub={
                          <>
                            {title} · <Ago time={x.time} />
                            {kind === 'trainer' || kind === 'manager'
                              ? ` · ${label(api, x.to)} · ${x.answered}${x.answered === 'Waiting' ? '' : ` · ${roleAnswer(kind, x.to)?.conf || x.conf || 1}`}`
                              : ''}
                          </>
                        }
                      />
                    )}
                  </For>
                </Group>
              );
            }}
          </For>
        </div>
      </section>
      <details>
        <summary class="a-head cursor-pointer" data-level="5">
          Answered · {answeredCount()}
        </summary>
        <div class="a-card mt-2 flex flex-col gap-2" data-variant="default">
          <Show
            when={answeredCount()}
            fallback={
              <p class="a-text" data-variant="muted">
                No earlier answers.
              </p>
            }
          >
            <For each={history()}>
              {(row) => {
                const role = historyRole(row);
                return (
                  <Row
                    href={href(
                      `/past/${encodeURIComponent(row.subject)}${role ? '/' + role : ''}`,
                    )}
                    title={label(api, row.subject)}
                    tail={<span aria-hidden="true">›</span>}
                    sub={
                      <>
                        {[...row.answers]
                          .sort((a, b) => a.question - b.question)
                          .map(
                            (a) =>
                              `${answerMark(a)} · ${a.yes ? 'Yes' : 'No'} · confidence ${a.conf || 1}`,
                          )
                          .concat(
                            row.player
                              ? [
                                  `Rate in ✓ · confidence ${(row.player as { conf?: number }).conf || 1}`,
                                ]
                              : [],
                          )
                          .join(' · ')}{' '}
                        · <Ago time={row.time} />
                      </>
                    }
                  />
                );
              }}
            </For>
            <For each={sent().finishedRoleAsks}>
              {(role) => (
                <Row
                  title={`${role === 'trainer' ? 'Trainer' : 'Manager'} ask`}
                  tail={<Chip status="Done" />}
                  sub={`Done · you're a ${role}`}
                />
              )}
            </For>
            <For each={sent().finished}>
              {(x) => (
                <Row
                  title={askee(x.to)}
                  tail={<Chip status="Answered" />}
                  sub={
                    <>
                      {sentKindName(x.request)} ask · <Ago time={x.time} />
                    </>
                  }
                />
              )}
            </For>
          </Show>
        </div>
      </details>
      <Show when={queue().later.length}>
        <section class="flex flex-col gap-2">
          <h2 class="a-head" data-level="4">
            Later
          </h2>
          <For each={queue().later}>
            {(x) => (
              <Row
                href={href(answerPath(x))}
                title={label(api, x.from)}
                tail={<span aria-hidden="true">›</span>}
                sub={`${deferredWhat(x.type)} · ${ago(x.time)}`}
              />
            )}
          </For>
        </section>
      </Show>
      <Show when={queue().ignored.length}>
        <details>
          <summary class="cursor-pointer">
            Ignored ({queue().ignored.length})
          </summary>
          <For each={queue().ignored}>
            {(x) => (
              <Row
                title={label(api, x.from)}
                tail={
                  <button
                    type="button"
                    class="a-button"
                    data-variant="ghost"
                    data-size="sm"
                    onClick={() =>
                      api.requests.restore({ from: x.from, to: props.p })
                    }
                  >
                    Un-ignore
                  </button>
                }
                sub={`${deferredWhat(x.type)} · ${ago(x.time)}`}
              />
            )}
          </For>
        </details>
      </Show>
      <p class="a-text" data-variant="muted">
        {queue().active.length
          ? queue().incoming.some((x) => x.status === 'Seated')
            ? 'Seated: can hold threshold-council tickets.'
            : 'Answer when you’re ready.'
          : 'You’re done here.'}
      </p>
    </>
  );
}

const deferredWhat = (type: string) =>
  type === 'player'
    ? 'Wants to be a player'
    : type === 'trainer'
      ? 'Rate as trainer'
      : 'Asked you';
