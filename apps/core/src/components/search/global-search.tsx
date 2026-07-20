import { useNavigate } from "@solidjs/router"
import { createMemo, createSignal, For, Show } from "solid-js"
import Avatar from "@/components/home/avatar"
import { useBackup, useNameResolver } from "@/hooks/use-backup"
import { useMyEvaluations } from "@/hooks/use-my-evaluations"
import type { DialogElement } from "@aura/ui"

const MAX_RESULTS = 8

/**
 * Global search — trigger button + dialog. Ported from the old
 * `GlobalSearchModal`, upgraded from a bare "jump to home with ?search=" to
 * live results: matching connections open `/subject/:id` directly; Enter
 * falls through to the filtered home list (old behavior).
 */
export default function GlobalSearch() {
  let dialog: DialogElement | undefined
  const navigate = useNavigate()

  const [query, setQuery] = createSignal("")

  // Same source as the home list: backup connections when decrypted,
  // node connections as the passkey-session fallback.
  const backup = useBackup()
  const { connections: nodeConnections } = useMyEvaluations()
  const nameOf = useNameResolver()

  const candidates = createMemo(() => {
    const conns = backup.data?.connections?.length
      ? backup.data.connections
      : (nodeConnections() ?? [])
    return [...new Map(conns.map((c) => [c.id, c])).values()].map((c) => ({
      id: c.id,
      name: nameOf(c.id),
    }))
  })

  const results = createMemo(() => {
    const q = query().trim().toLowerCase()
    if (!q) return []
    return candidates()
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
  })

  const open = () => {
    setQuery("")
    dialog?.show()
  }

  const goToSubject = (id: string) => {
    dialog?.hide()
    navigate(`/subject/${id}`)
  }

  // Enter: single hit opens the subject, otherwise show the filtered list.
  const submit = () => {
    const q = query().trim()
    if (!q) return
    const hits = results()
    if (hits.length === 1) return goToSubject(hits[0].id)
    dialog?.hide()
    navigate(`/home/player?search=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <a-button
        size="icon-sm"
        variant="glass"
        aria-label="Search"
        data-testid="global-search-trigger"
        onClick={open}
      >
        <a-icon name="search" />
      </a-button>

      <a-dialog ref={dialog}>
        <div slot="content" class="flex w-80 max-w-full flex-col gap-3">
          <div class="flex flex-col gap-1">
            <a-head class="text-lg" data-testid="global-search-modal-title">
              Global Search
            </a-head>
            <a-text variant="muted">Search from your connections</a-text>
          </div>

          <div class="flex items-center gap-2">
            <a-input
              class="flex-1"
              type="text"
              autofocus
              data-testid="global-search-input"
              placeholder="Subject name or ID …"
              value={query()}
              onChange={(e: CustomEvent<string>) => setQuery(e.detail)}
              onKeyDown={(e: KeyboardEvent) => e.key === "Enter" && submit()}
            >
              <a-icon name="search" slot="prefix" />
            </a-input>
            <a-button data-testid="global-search-submit" onClick={submit}>
              Search
            </a-button>
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
                    <div class="min-w-0">
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
            <a-text variant="muted">No connection matches.</a-text>
          </Show>
        </div>
      </a-dialog>
    </>
  )
}
