import { For, Show } from "solid-js"
import type { useSubjectsList } from "@/hooks/use-subjects-list"
import type { SubjectRatedState, SubjectSort } from "@/hooks/use-subjects-list"
import { toTitleCase } from "@/shared/lib/text"
import type { ConnectionLevel } from "@aura/domain/types/aura"
import type { DialogElement } from "@aura/ui"

type Controls = ReturnType<typeof useSubjectsList>

const SORTS: { id: SubjectSort; label: string }[] = [
  { id: "recency", label: "Recency" },
  { id: "name", label: "Name" },
]

const RATED_STATES: { id: SubjectRatedState; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unrated", label: "Unrated" },
  { id: "rated", label: "Rated" },
]

/**
 * Search + filter + sort controls for the subjects list. Collapses the old
 * three-modal design (SubjectListControls + FiltersModal + SortsModal) into a
 * single inline search box and one `<a-dialog>` holding the filter/sort toggles.
 */
export default function SubjectListControls(props: {
  controls: Controls
  count: number
}) {
  let dialog: DialogElement | undefined

  const c = () => props.controls
  const activeFilters = () =>
    c().levels().length + (c().ratedState() !== "all" ? 1 : 0)

  return (
    <div class="flex flex-col gap-2">
      <a-input
        type="text"
        data-testid="subject-search"
        placeholder="Subject name or ID…"
        value={c().search()}
        onChange={(e: CustomEvent<string>) => c().setSearch(e.detail)}
      >
        <a-icon name="search" slot="prefix" />
      </a-input>

      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <a-dialog ref={dialog}>
          <a-button slot="trigger" size="sm" variant="glass">
            <span class="flex items-center gap-1.5">
              <a-icon name="sliders-horizontal" />
              Filter & sort
              <Show when={activeFilters() > 0}>
                <span
                  data-testid="subject-controls-badge"
                  class="rounded-full bg-foreground/15 px-1.5 text-xs"
                >
                  {activeFilters()}
                </span>
              </Show>
            </span>
          </a-button>

          <div slot="content" class="flex w-80 max-w-full flex-col gap-5">
            <div class="flex flex-col gap-2">
              <a-text variant="muted">Sort by</a-text>
              <div class="flex flex-wrap gap-2">
                <For each={SORTS}>
                  {(s) => (
                    <a-button
                      data-testid={`subject-sort-${s.id}`}
                      size="sm"
                      variant="glass"
                      color="secondary"
                      selected={c().sort() === s.id}
                      onClick={() => c().setSort(s.id)}
                    >
                      {s.label}
                    </a-button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <a-text variant="muted">Your evaluation</a-text>
              <div class="flex flex-wrap gap-2">
                <For each={RATED_STATES}>
                  {(r) => (
                    <a-button
                      data-testid={`subject-rated-${r.id}`}
                      size="sm"
                      variant="glass"
                      color="secondary"
                      selected={c().ratedState() === r.id}
                      onClick={() => c().setRatedState(r.id)}
                    >
                      {r.label}
                    </a-button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <a-text variant="muted">Connection level</a-text>
              <div class="flex flex-wrap gap-2">
                <For each={c().levelOptions}>
                  {(level: ConnectionLevel) => (
                    <a-button
                      data-testid={`subject-level-${level.split(" ").join("-")}`}
                      size="sm"
                      variant="glass"
                      color="secondary"
                      selected={c().levels().includes(level)}
                      onClick={() => c().toggleLevel(level)}
                    >
                      {toTitleCase(level)}
                    </a-button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex gap-2">
              <a-button
                class="flex-1"
                variant="ghost"
                data-testid="subject-controls-clear"
                onClick={() => c().reset()}
              >
                Clear
              </a-button>
              <a-button
                class="flex-1"
                variant="default"
                data-testid="subject-controls-done"
                onClick={() => dialog?.hide()}
              >
                Done
              </a-button>
            </div>
          </div>
        </a-dialog>

        <span data-testid="subject-results" class="ml-auto">
          {props.count} result{props.count === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  )
}
