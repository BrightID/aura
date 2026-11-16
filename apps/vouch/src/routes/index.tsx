import { A } from '@solidjs/router';
import { For, Match, Show, Switch, type JSX } from 'solid-js';
import { useApp } from '@/app';
import { Ago, Chip, Row } from '@/components';
import { deriveRequestQueue } from '@/model/derive';
import {
  askName,
  askStatus,
  chipName,
  homeCard,
  isOperator,
  label,
  operatorAsked,
  operatorNo,
  operatorYes,
  requestKinds,
  roleChips,
  sharedControlDone,
} from '@/model/view';

const KIND_NAMES = {
  player: 'player ask',
  trainer: 'trainer ask',
  manager: 'manager ask',
  operator: 'node operator question',
};

const Card = (props: { children: JSX.Element }) => (
  <section class="a-card flex flex-col gap-2" data-variant="default">
    {props.children}
  </section>
);

const Title = (props: { children: string; bad?: boolean }) => (
  <h2 class="a-head" data-level="4" data-state={props.bad ? 'bad' : undefined}>
    {props.children}
  </h2>
);

export default function Home() {
  const { api, setPracticeOpen } = useApp();
  const p = () => api.state.persona;
  return (
    <Show
      when={p() !== 'newcomer'}
      fallback={
        <Card>
          <Title>Welcome to Vouch</Title>
          <p class="a-text">
            Pick a person in Practice to see Vouch as they do.
          </p>
          <button
            type="button"
            class="a-button self-start"
            onClick={() => setPracticeOpen(true)}
          >
            Open Practice
          </button>
        </Card>
      }
    >
      <SignedIn p={p()} />
    </Show>
  );
}

function SignedIn(props: { p: string }) {
  const { api, href } = useApp();
  const chips = () => roleChips(api, props.p);
  const queue = () => deriveRequestQueue(api, props.p);
  const nodes = () => api.disclosure.get(props.p).nodes;
  const asked = () => operatorAsked(api, props.p);
  const yes = () => operatorYes(api, props.p);

  const nodeRows = () => (
    <For each={nodes()}>
      {(node, i) => (
        <Row
          title={`Node ${i() + 1}`}
          sub={
            <>
              {node.location} · <Ago time={node.added} />
            </>
          }
        />
      )}
    </For>
  );
  const setup = () => (
    <section class="flex flex-col gap-1">
      <h3 class="a-head" data-level="6">
        Your setup
      </h3>
      <For each={nodes()}>
        {(node, i) => (
          <p class="text-sm">
            Node {i() + 1} · {node.location}
          </p>
        )}
      </For>
      <p class="text-sm">
        Shared control ·{' '}
        {api.disclosure
          .get(props.p)
          .controlRelationships.map((id) => label(api, id))
          .join(', ') || 'Just me'}
      </p>
    </section>
  );
  const asks = () => (
    <Show when={asked().length}>
      <section class="flex flex-col gap-1">
        <h3 class="a-head" data-level="6">
          Your asks
        </h3>
        <For each={asked()}>
          {(x) => (
            <Row
              title={askName(api, x)}
              tail={<Chip status={askStatus(api, props.p, x.to)} />}
              sub={<Ago time={x.time} />}
            />
          )}
        </For>
      </section>
    </Show>
  );

  return (
    <>
      <h1 class="a-head" data-level="2">
        Hi, {label(api, props.p)}
      </h1>
      <Show when={chips().items.length}>
        <div class="flex flex-wrap gap-2" aria-label="Your roles">
          <For each={chips().items}>
            {(chip) => (
              <span class="a-badge role-chip" data-role={chip.role}>
                {chipName(chip.role)}
                <Show
                  when={chip.state}
                  fallback={chip.level ? ` L${chip.level}` : ''}
                >
                  {' · '}
                  <span
                    data-state={
                      chip.state === 'seated'
                        ? 'good'
                        : chip.state === 'held back'
                          ? 'bad'
                          : 'dim'
                    }
                  >
                    {chip.state}
                  </span>
                </Show>
              </span>
            )}
          </For>
        </div>
        <Show when={chips().openAsk}>
          {(ask) => (
            <A class="vouch-link" href={href('/requests')}>
              {ask().role === 'trainer' ? 'Trainer' : 'Manager'} ask ·{' '}
              {ask().yes} of {ask().required} Yes
            </A>
          )}
        </Show>
      </Show>
      <Show when={isOperator(api, props.p)}>
        <p class="a-text" data-variant="muted">
          Key ✓ · Nodes {nodes().length ? '✓' : '—'} · Shared control{' '}
          {sharedControlDone(api, props.p) ? '✓' : '—'} · Endorsed {yes()} of 2
        </p>
      </Show>
      <Show when={queue().rows.length}>
        <div class="flex flex-col gap-2">
          <A class="vouch-link" href={href('/requests')}>
            Requests waiting · {queue().rows.length} →
          </A>
          <div class="flex flex-wrap gap-2" aria-label="Requests by kind">
            <For
              each={Object.entries(requestKinds(queue().rows)).filter(
                ([, n]) => n,
              )}
            >
              {([kind, n]) => (
                <span class="a-badge role-chip" data-size="sm" data-role={kind}>
                  {n} {KIND_NAMES[kind as keyof typeof KIND_NAMES]}
                  {n === 1 ? '' : 's'}
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>
      {/* For homeCard's other results (choose-role, list-nodes, more-nodes,
          shared-control, player, trainer, manager) Home shows no card: each card
          only leads to a flow not ported from vouch-app yet. Add the card with
          its flow. */}
      <Switch>
        <Match when={homeCard(api, props.p) === 'held-back'}>
          <Card>
            <Title bad>Held back by a No</Title>
            <p class="a-text" data-variant="muted">
              {label(api, operatorNo(api, props.p)!.r)} answered No on{' '}
              {operatorNo(api, props.p)!.question}
            </p>
          </Card>
        </Match>
        <Match when={homeCard(api, props.p) === 'all-set'}>
          <Card>
            <Title>You're all set as a node operator</Title>
            {nodeRows()}
            <A class="vouch-link" href={href('/partner')}>
              What Interfold sees →
            </A>
          </Card>
        </Match>
        <Match when={homeCard(api, props.p) === 'waiting'}>
          <Card>
            <p class="a-text" data-state="good">
              ✓ You've done your part. Now we wait for their answers.
            </p>
            <Title>You're waiting on endorsements</Title>
            <p class="a-text" data-variant="muted">
              {yes()} of 2 answered Yes
            </p>
            {setup()}
            {asks()}
          </Card>
        </Match>
        <Match when={homeCard(api, props.p) === 'get-endorsed'}>
          <Card>
            <Title>Get endorsed</Title>
            <p class="a-text" data-variant="muted">
              You'll need 2 endorsements to run a node.
            </p>
            <p class="a-text">{asked().length} of 2 asked</p>
            <Show when={yes()}>
              <p class="a-text">{yes()} of 2 answered Yes</p>
            </Show>
          </Card>
          <Card>
            {setup()}
            {asks()}
          </Card>
        </Match>
      </Switch>
    </>
  );
}
