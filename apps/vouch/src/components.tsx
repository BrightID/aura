import { A } from '@solidjs/router';
import { For, Show, createSignal, onCleanup, type JSX } from 'solid-js';
import { answerKey, useApp } from '@/app';
import type { Vote } from '@/adapter/types';
import { choiceKey } from '@/model/derive';
import {
  ago,
  confidenceFromHold,
  label,
  ownAnswer,
  stateClass,
  type AnswerKind,
} from '@/model/view';

// The small pieces the screens share.

export const Ago = (props: { time?: string }) => (
  <time
    datetime={props.time}
    title={props.time && new Date(props.time).toLocaleString()}
  >
    {ago(props.time)}
  </time>
);

export const Chip = (props: { status: string }) => (
  <span class="a-badge" data-size="sm" data-state={stateClass(props.status)}>
    {props.status}
  </span>
);

/** A role name in its role colour. */
export const RoleWord = (props: { role: string; children: JSX.Element }) => (
  <span class="role-word" data-role={props.role}>
    {props.children}
  </span>
);

/**
 * The ← Back link. It always opens `to`, the page the caller names (Home or
 * Requests), with ?room= kept. It never steps back in browser history, which
 * could leave Vouch: a page opened from a shared link has no Vouch page behind
 * it. Vouch also runs inside the landing site (apps/landing), whose link
 * handling gives every Vouch history entry the same router depth, so a depth
 * check cannot tell where Vouch's entries start either.
 */
export function Back(props: { to: '/' | '/requests' }) {
  const { href } = useApp();
  return (
    <A
      href={href(props.to)}
      class="a-button self-start"
      data-variant="ghost"
      data-size="sm"
    >
      ← Back
    </A>
  );
}

/** A list row: links to `href` when given. */
export function Row(props: {
  title: JSX.Element;
  sub?: JSX.Element;
  tail?: JSX.Element;
  href?: string;
}) {
  const body = (
    <>
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-medium">{props.title}</span>
        <span class="text-sm text-muted-foreground">
          {props.sub ?? 'Not rated yet'}
        </span>
      </span>
      <span class="flex shrink-0 items-center gap-1">{props.tail}</span>
    </>
  );
  return (
    <Show when={props.href} fallback={<div class="vouch-row">{body}</div>}>
      <A class="vouch-row" data-tap href={props.href!}>
        {body}
      </A>
    </Show>
  );
}

/** Two dots for the first answers to one question, No first, and a count of the rest. */
export function VoteCell(props: { votes: Vote[] }) {
  const no = () => props.votes.some((x) => !x.yes);
  const shown = () =>
    (no()
      ? [
          ...props.votes.filter((x) => !x.yes),
          ...props.votes.filter((x) => x.yes),
        ]
      : props.votes
    ).slice(0, 2);
  const extra = () => Math.max(0, props.votes.length - 2);
  return (
    <span
      class="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${props.votes.filter((x) => x.yes).length} Yes, ${props.votes.filter((x) => !x.yes).length} No`}
    >
      <For each={[0, 1]}>
        {(i) => <span class="vote-dot" data-yes={shown()[i]?.yes} />}
      </For>
      <Show when={extra()}>
        <span class="text-xs text-muted-foreground">+{extra()}</span>
      </Show>
    </span>
  );
}

export function VoteList(props: { votes: Vote[] }) {
  const { api } = useApp();
  return (
    <Show
      when={props.votes.length}
      fallback={
        <p class="a-text" data-variant="muted">
          No answers recorded.
        </p>
      }
    >
      <For each={props.votes}>
        {(v) => (
          <div class="flex justify-between gap-2 text-sm">
            <span>
              {label(api, v.r)}{' '}
              <b data-state={v.yes ? 'good' : 'bad'}>{v.yes ? 'Yes' : 'No'}</b>{' '}
              · confidence {v.c}
            </span>
            <Ago time={v.t} />
          </div>
        )}
      </For>
    </Show>
  );
}

export function DoneState(props: {
  title: string;
  next?: string;
  onNext?: () => void;
}) {
  return (
    <div class="a-card flex flex-col items-start gap-2" data-variant="default">
      <span class="font-semibold">{props.title}</span>
      <Show when={props.next}>
        <button type="button" class="a-button" onClick={props.onNext}>
          {props.next}
        </button>
      </Show>
    </div>
  );
}

/**
 * Press and hold: the confidence grows the longer the button is held (see
 * confidenceFromHold), and the answer is given on release. A click without a
 * press, such as from the keyboard, answers at confidence 1.
 */
function holdToAnswer(
  setHeld: (conf: number) => void,
  onAnswer: (conf: number) => void,
) {
  let start = 0;
  let clickUntil = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
    setHeld(0);
  };
  return {
    stop,
    onPointerDown(e: PointerEvent & { currentTarget: HTMLButtonElement }) {
      start = performance.now();
      setHeld(1);
      timer = setInterval(
        () => setHeld(confidenceFromHold(performance.now() - start)),
        60,
      );
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // setPointerCapture throws if the pointer is already gone. Capture only
        // keeps the hold going when the pointer slides off the button, so
        // the hold works without it.
      }
    },
    onPointerUp() {
      if (!timer) return;
      const conf = confidenceFromHold(performance.now() - start);
      stop();
      // The browser fires a click right after this pointerup. Without this
      // guard that click would answer a second time, at confidence 1.
      clickUntil = Date.now() + 600;
      onAnswer(conf);
    },
    onClick() {
      if (Date.now() > clickUntil) onAnswer(1);
    },
  };
}

function AnswerSlot(props: {
  yes: boolean;
  chosen: boolean;
  pending: boolean;
  conf: number;
  onAnswer: (conf: number) => void;
  onUndo: () => void;
}) {
  const [held, setHeld] = createSignal(0);
  const hold = holdToAnswer(setHeld, (conf) => props.onAnswer(conf));
  onCleanup(hold.stop);
  const word = props.yes ? 'Yes' : 'No';
  return (
    <div class="flex flex-1 flex-col items-center gap-1">
      <button
        type="button"
        class="a-button answer-slot w-full"
        data-color={props.yes ? 'success' : 'destructive'}
        data-variant={props.chosen ? undefined : 'outline'}
        aria-pressed={props.chosen}
        aria-label={
          word + (props.chosen ? `, confidence ${props.conf} of 4` : '')
        }
        onPointerDown={hold.onPointerDown}
        onPointerUp={hold.onPointerUp}
        onPointerCancel={hold.stop}
        onClick={hold.onClick}
      >
        <span>{props.chosen ? (props.pending ? '' : 'Sent ✓') : word}</span>
        <span class="conf-segs" aria-hidden="true">
          <For each={[1, 2, 3, 4]}>
            {(i) => (
              <i
                data-filled={(held() || (props.chosen ? props.conf : 0)) >= i}
              />
            )}
          </For>
        </span>
      </button>
      <Show when={props.pending && props.chosen}>
        <span class="text-sm">
          Sending…{' '}
          <button
            type="button"
            class="a-button"
            data-variant="ghost"
            data-size="sm"
            onClick={props.onUndo}
          >
            Undo
          </button>
        </span>
      </Show>
    </div>
  );
}

/** Not now / Ignore for `subject`'s request, each with an undo window. */
export function ChoiceControl(props: { subject: string }) {
  const app = useApp();
  const key = () => choiceKey(app.api.state.persona, props.subject);
  const chosen = () => app.api.state.choices[key()];
  const pending = () => app.pendingChoices[key()];
  const button = (kind: 'later' | 'ignored', text: string) => (
    <Show
      when={pending()?.kind !== kind}
      fallback={
        <span>
          {kind === 'later' ? 'Skipping…' : 'Ignoring…'}{' '}
          <button
            type="button"
            class="a-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => app.undoChoice(props.subject)}
          >
            Undo
          </button>
        </span>
      }
    >
      <button
        type="button"
        class="a-button"
        data-variant="ghost"
        data-size="sm"
        aria-label={
          kind === 'later' ? 'Skip this request for later (Not now)' : undefined
        }
        onClick={() => app.defer(props.subject, kind)}
      >
        {text}
      </button>
    </Show>
  );
  return (
    <div class="flex items-center gap-2 text-sm" aria-live="polite">
      <Show when={chosen() !== 'ignored'} fallback={<span>Ignored</span>}>
        <Show when={chosen() === 'later'}>
          <span>Skipped</span>
        </Show>
        {button('later', 'Not now')}
        {button('ignored', 'Ignore')}
      </Show>
    </div>
  );
}

const GROUP_LABEL: Record<AnswerKind, string> = {
  question: '',
  player: 'Player request',
  trainer: 'Trainer rating',
  manager: 'Manager rating',
};

/** Yes and No for one question, the answer's status line, and Not now / Ignore. */
export function AnswerControl(props: {
  kind: AnswerKind;
  subject: string;
  question?: number;
}) {
  const app = useApp();
  const q = () => props.question ?? 0;
  const key = () =>
    answerKey(app.api.state.persona, props.kind, props.subject, q());
  const entry = () => app.pendingAnswers[key()];
  const record = () =>
    ownAnswer(app.api, app.api.state.persona, props.kind, props.subject, q());
  const conf = () => {
    const c = entry()?.conf ?? record()?.conf;
    return Number.isInteger(c) && c! >= 1 && c! <= 4 ? c! : 1;
  };
  const slot = (yes: boolean) => (
    <AnswerSlot
      yes={yes}
      chosen={
        entry() ? entry()!.yes === yes : !!record() && record()!.yes === yes
      }
      pending={!!entry()}
      conf={conf()}
      onAnswer={(c) => app.answer(props.kind, props.subject, q(), yes, c)}
      onUndo={() => app.undoAnswer(key())}
    />
  );
  return (
    <div class="flex flex-col gap-2">
      <div
        class="flex gap-2"
        role="group"
        aria-label={GROUP_LABEL[props.kind] || `Question ${q() + 1}`}
      >
        {slot(true)}
        {slot(false)}
      </div>
      <p class="text-sm" aria-live="polite">
        <Show
          when={!entry()}
          fallback={`Confidence ${entry()?.conf} of 4 · Tap again or Undo`}
        >
          <Show when={record()}>
            {(r) => (
              <span data-state={r().yes ? 'good' : 'bad'}>
                {r().edited ? 'Edited · ' : ''}Answered {r().yes ? 'Yes' : 'No'}{' '}
                · confidence {r().conf || 1} · <Ago time={r().time} />
              </span>
            )}
          </Show>
        </Show>
      </p>
      <Show when={props.kind !== 'question' || q() === 0}>
        <ChoiceControl subject={props.subject} />
      </Show>
    </div>
  );
}
