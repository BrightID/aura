import Dialog from '@/components/ui/dialog';
import { useNavigate } from '@solidjs/router';
import { createMemo, createSignal, For, Show } from 'solid-js';
import Avatar from '@/components/home/avatar';
import { useBackup, useNameResolver } from '@/hooks/use-backup';
import { useMyEvaluations } from '@/hooks/use-my-evaluations';
import type { DialogHandle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const MAX_RESULTS = 8;

/**
 * Global search — trigger button + dialog. Ported from the old
 * `GlobalSearchModal`, upgraded from a bare "jump to home with ?search=" to
 * live results: matching connections open `/subject/:id` directly; Enter
 * falls through to the filtered home list (old behavior).
 */
export default function GlobalSearch() {
  let dialog: DialogHandle | undefined;
  const navigate = useNavigate();

  const [query, setQuery] = createSignal('');

  // Same source as the home list: backup connections when decrypted,
  // node connections as the passkey-session fallback.
  const backup = useBackup();
  const { connections: nodeConnections } = useMyEvaluations();
  const nameOf = useNameResolver();

  const candidates = createMemo(() => {
    const conns = backup.data?.connections?.length
      ? backup.data.connections
      : (nodeConnections() ?? []);
    return [...new Map(conns.map((c) => [c.id, c])).values()].map((c) => ({
      id: c.id,
      name: nameOf(c.id),
    }));
  });

  const results = createMemo(() => {
    const q = query().trim().toLowerCase();
    if (!q) return [];
    return candidates()
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  });

  const open = () => {
    setQuery('');
    dialog?.show();
  };

  const goToSubject = (id: string) => {
    dialog?.hide();
    navigate(`/subject/${id}`);
  };

  // Enter: single hit opens the subject, otherwise show the filtered list.
  const submit = () => {
    const q = query().trim();
    if (!q) return;
    const hits = results();
    if (hits.length === 1) return goToSubject(hits[0].id);
    dialog?.hide();
    navigate(`/home/player?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <button
        class="a-button"
        type="button"
        data-size="icon"
        data-variant="glass"
        aria-label="Search"
        data-testid="global-search-trigger"
        onClick={open}
      >
        <Icon name="search" />
      </button>

      <Dialog label="Global search" ref={dialog}>
        <div class="flex w-80 max-w-full flex-col gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="a-head text-lg" data-testid="global-search-modal-title">
              Global Search
            </h2>
            <p class="a-text" data-variant="muted">
              Search from your connections
            </p>
          </div>

          <div class="flex items-center gap-2">
            <div class="a-input-group min-w-0 flex-1">
              <Icon name="search" />
              <input
                class="a-input"
                type="text"
                autofocus
                data-testid="global-search-input"
                placeholder="Subject name or ID …"
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <button
              class="a-button"
              type="button"
              data-testid="global-search-submit"
              onClick={submit}
            >
              Search
            </button>
          </div>

          <Show when={results().length > 0}>
            <div class="flex max-h-72 flex-col gap-1 overflow-y-auto">
              <For each={results()}>
                {(subject) => (
                  <button
                    type="button"
                    data-testid={`global-search-result-${subject.id}`}
                    class="flex items-center gap-3 rounded-md p-2 text-left hover:bg-foreground/5"
                    onClick={() => goToSubject(subject.id)}
                  >
                    <Avatar
                      name={subject.name}
                      subjectId={subject.id}
                      noHover
                      class="h-9 w-9 text-sm"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="truncate font-medium text-foreground">
                        {subject.name}
                      </p>
                      <p class="truncate text-xs text-muted-foreground">
                        {subject.id}
                      </p>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
          <Show when={query().trim() && results().length === 0}>
            <p class="a-text" data-variant="muted">
              No connection matches.
            </p>
          </Show>
        </div>
      </Dialog>
    </>
  );
}
