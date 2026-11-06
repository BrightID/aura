import Dialog from '@/components/ui/dialog';
import { For, Show } from 'solid-js';
import type { useSubjectsList } from '@/hooks/use-subjects-list';
import type { SubjectRatedState, SubjectSort } from '@/hooks/use-subjects-list';
import { toTitleCase } from '@/shared/lib/text';
import type { ConnectionLevel } from '@aura/domain/types/aura';
import type { DialogHandle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type Controls = ReturnType<typeof useSubjectsList>;

const SORTS: { id: SubjectSort; label: string }[] = [
  { id: 'recency', label: 'Recency' },
  { id: 'name', label: 'Name' },
];

const RATED_STATES: { id: SubjectRatedState; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unrated', label: 'Unrated' },
  { id: 'rated', label: 'Rated' },
];

/**
 * Search, filter and sort controls for the subjects list: an inline search
 * box, and one `<Dialog>` that holds the filter and sort toggles.
 */
export default function SubjectListControls(props: {
  controls: Controls;
  count: number;
}) {
  let dialog: DialogHandle | undefined;

  const c = () => props.controls;
  const activeFilters = () =>
    c().levels().length + (c().ratedState() !== 'all' ? 1 : 0);

  return (
    <div class="flex flex-col gap-2">
      <div class="a-input-group">
        <Icon name="search" />
        <input
          class="a-input"
          type="text"
          data-testid="subject-search"
          placeholder="Subject name or ID…"
          value={c().search()}
          onInput={(e) => c().setSearch(e.currentTarget.value)}
        />
      </div>

      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Dialog
          label="Filter and sort connections"
          ref={dialog}
          trigger={
            <button
              class="a-button"
              type="button"
              data-size="sm"
              data-variant="glass"
            >
              <span class="flex items-center gap-1.5">
                <Icon name="sliders-horizontal" />
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
            </button>
          }
        >
          <div class="flex w-80 max-w-full flex-col gap-5">
            <div class="flex flex-col gap-2">
              <p class="a-text" data-variant="muted">
                Sort by
              </p>
              <div class="flex flex-wrap gap-2">
                <For each={SORTS}>
                  {(s) => (
                    <button
                      class="a-button"
                      type="button"
                      data-testid={`subject-sort-${s.id}`}
                      data-size="sm"
                      data-variant="glass"
                      data-color="secondary"
                      aria-pressed={c().sort() === s.id}
                      onClick={() => c().setSort(s.id)}
                    >
                      {s.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <p class="a-text" data-variant="muted">
                Your evaluation
              </p>
              <div class="flex flex-wrap gap-2">
                <For each={RATED_STATES}>
                  {(r) => (
                    <button
                      class="a-button"
                      type="button"
                      data-testid={`subject-rated-${r.id}`}
                      data-size="sm"
                      data-variant="glass"
                      data-color="secondary"
                      aria-pressed={c().ratedState() === r.id}
                      onClick={() => c().setRatedState(r.id)}
                    >
                      {r.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <p class="a-text" data-variant="muted">
                Connection level
              </p>
              <div class="flex flex-wrap gap-2">
                <For each={c().levelOptions}>
                  {(level: ConnectionLevel) => (
                    <button
                      class="a-button"
                      type="button"
                      data-testid={`subject-level-${level.split(' ').join('-')}`}
                      data-size="sm"
                      data-variant="glass"
                      data-color="secondary"
                      aria-pressed={c().levels().includes(level)}
                      onClick={() => c().toggleLevel(level)}
                    >
                      {toTitleCase(level)}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                class="a-button flex-1"
                type="button"
                data-variant="ghost"
                data-testid="subject-controls-clear"
                onClick={() => c().reset()}
              >
                Clear
              </button>
              <button
                class="a-button flex-1"
                type="button"
                data-variant="default"
                data-testid="subject-controls-done"
                onClick={() => dialog?.hide()}
              >
                Done
              </button>
            </div>
          </div>
        </Dialog>

        <span data-testid="subject-results" class="ml-auto">
          {props.count} result{props.count === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
