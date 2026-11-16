import { A, useNavigate, type RouteSectionProps } from '@solidjs/router';
import { For, Show, createEffect, createSignal } from 'solid-js';
import { useApp } from '@/app';
import { deriveRequestQueue } from '@/model/derive';
import { PERSONAS, label, personaLabel } from '@/model/view';

/** The header, the Practice drawer and the tabs around every page. */
export default function Shell(props: RouteSectionProps) {
  const app = useApp();
  const { api, sync } = app;
  const navigate = useNavigate();
  const persona = () => api.state.persona;
  const waiting = () =>
    persona() === 'newcomer'
      ? 0
      : deriveRequestQueue(api, persona()).rows.length;
  const [drawer, setDrawer] = createSignal<HTMLDialogElement>();
  createEffect(() => {
    const dialog = drawer();
    if (!dialog) return;
    if (!app.practiceOpen()) dialog.close();
    else if (!dialog.open) dialog.showModal();
  });

  const created = () => Object.keys(api.state.identities);
  const inUse = (id: string) =>
    sync?.here().some((x) => x.browserId !== sync.browserId && x.persona === id)
      ? ' · in use'
      : '';
  const choose = (id: string) => {
    app.setPersona(id);
    app.setPracticeOpen(false);
    navigate(app.href('/'));
  };

  const [teamCode, setTeamCode] = createSignal('');
  const [resetError, setResetError] = createSignal('');
  const resetRoom = async (e: SubmitEvent) => {
    e.preventDefault();
    setResetError('');
    try {
      if (!(await sync!.reset(teamCode()))) setResetError('Wrong team code');
    } catch {
      // A network failure needs no message here: the room sync's status line
      // in this drawer already reads "Not synced · retrying".
    }
  };

  return (
    <div class="mx-auto flex max-w-md flex-col gap-4 p-4">
      <header class="flex items-center justify-between gap-2">
        <span class="a-head" data-level="4">
          Vouch
        </span>
        <button
          type="button"
          class="a-button"
          data-variant="outline"
          data-size="sm"
          aria-expanded={app.practiceOpen()}
          aria-controls="practice-drawer"
          onClick={() => app.setPracticeOpen(true)}
        >
          Practice
        </button>
      </header>
      <dialog
        ref={setDrawer}
        id="practice-drawer"
        class="a-sheet"
        aria-labelledby="practice-title"
        onClose={() => app.setPracticeOpen(false)}
      >
        <div class="flex items-center justify-between">
          <h2 id="practice-title" class="a-head" data-level="4">
            Practice
          </h2>
          <button
            type="button"
            class="a-button"
            data-variant="ghost"
            data-size="sm"
            onClick={() => app.setPracticeOpen(false)}
          >
            Close
          </button>
        </div>
        <p class="a-text" data-variant="muted">
          Everything here is practice. Nothing touches the real BrightID
          network.
        </p>
        <Show when={sync}>
          {(room) => (
            <p class="a-text" data-variant="small" role="status">
              Room · {app.room} ·{' '}
              {
                new Set(
                  room()
                    .here()
                    .map((x) => x.browserId),
                ).size
              }{' '}
              here
              {room().status() ? ` · ${room().status()}` : ''}
            </p>
          )}
        </Show>
        <p class="a-text" data-variant="small">
          {persona() === 'newcomer'
            ? "You haven't picked anyone yet."
            : `You're ${label(api, persona())}`}
        </p>
        <label class="a-field">
          Person
          <select
            class="a-input"
            onChange={(e) => choose(e.currentTarget.value)}
          >
            <option value="newcomer" selected={persona() === 'newcomer'}>
              Newcomer — not signed in
            </option>
            <For each={PERSONAS}>
              {(id) => (
                <option value={id} selected={persona() === id}>
                  {personaLabel(api, id)}
                  {inUse(id)}
                </option>
              )}
            </For>
            <Show when={created().length}>
              <optgroup label="New on this call">
                <For each={created()}>
                  {(id) => (
                    <option value={id} selected={persona() === id}>
                      {personaLabel(api, id)}
                      {inUse(id)}
                    </option>
                  )}
                </For>
              </optgroup>
            </Show>
          </select>
        </label>
        <Show
          when={sync}
          fallback={
            <button
              type="button"
              class="a-button"
              data-variant="secondary"
              onClick={() => {
                app.resetPractice();
                app.setPracticeOpen(false);
                navigate(app.href('/'));
              }}
            >
              Reset practice
            </button>
          }
        >
          <form class="flex flex-col gap-2" onSubmit={resetRoom}>
            <p class="a-text" data-variant="small">
              Practice people go back to the start. Real people who joined, and
              what passed between them, stay.
            </p>
            <label class="a-field">
              Team code
              <input
                class="a-input"
                type="text"
                autocomplete="off"
                required
                value={teamCode()}
                onInput={(e) => setTeamCode(e.currentTarget.value)}
              />
            </label>
            <button type="submit" class="a-button" data-variant="secondary">
              Reset this room to the start
            </button>
            <p class="a-text" data-variant="small" role="status">
              {resetError()}
            </p>
          </form>
        </Show>
      </dialog>
      <nav class="a-tabs" aria-label="App pages">
        <A class="a-tab" href={app.href('/')} end>
          Home
        </A>
        <Show when={persona() !== 'newcomer'}>
          <A class="a-tab" href={app.href('/requests')}>
            Requests
            <Show when={waiting()}>
              <span class="a-badge" data-size="xs" aria-hidden="true">
                {waiting()}
              </span>
            </Show>
          </A>
        </Show>
      </nav>
      <main class="flex flex-col gap-4">{props.children}</main>
    </div>
  );
}
