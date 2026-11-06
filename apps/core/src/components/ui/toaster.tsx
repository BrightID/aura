import { createSignal, For, onCleanup, Show } from 'solid-js';
import { subscribe, toast, type ToastData } from '@aura/ui/toast';

/**
 * Renders the toasts raised with `toast()` from '@aura/ui/toast'. Mount once.
 * Clicking a toast, or its close button, dismisses it.
 */
export default function Toaster() {
  // <For> keys each node by the store's toast object, so a dismissed toast
  // takes its own node with it and the others keep theirs. The store changes
  // that object in place and emits the same objects again, so the signal has
  // equals: false, and each field is read through t(), which reads list() and
  // so re-runs on every emit.
  const [list, setList] = createSignal<ToastData[]>([], { equals: false });
  onCleanup(subscribe(setList));

  return (
    <div class="a-toaster" role="status" aria-live="polite">
      <For each={list()}>
        {(item) => {
          const t = () => (list(), item);
          return (
            <div
              class="a-toast"
              data-variant={t().variant}
              data-hidden={t().visible ? undefined : ''}
              onClick={() => toast.dismiss(t().id)}
            >
              <button
                type="button"
                class="a-toast-close"
                aria-label="Dismiss"
                onClick={() => toast.dismiss(t().id)}
              >
                ×
              </button>
              <div class="flex items-start gap-2">
                <Show when={t().variant === 'loading'}>
                  <span class="mt-0.5 size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </Show>
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{String(t().message)}</div>
                  <Show when={t().description}>
                    <div class="mt-0.5 text-muted-foreground">
                      {t().description}
                    </div>
                  </Show>
                  <Show when={t().action}>
                    {(action) => (
                      <button
                        type="button"
                        class="a-button mt-2"
                        data-size="sm"
                        data-variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          action().onClick();
                        }}
                      >
                        {action().label}
                      </button>
                    )}
                  </Show>
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
