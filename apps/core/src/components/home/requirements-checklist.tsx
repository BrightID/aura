import { For, Show } from "solid-js"
import { compactFormat } from "@/shared/lib/number"

export type BaseRequirement = { title: string; requirement: number }
export type LevelRequirement =
  | BaseRequirement
  | { OR?: BaseRequirement[]; AND?: BaseRequirement[] }

const isBase = (item: LevelRequirement): item is BaseRequirement =>
  "title" in item

/** One checklist row, or a nested AND/OR group of rows. */
function ChecklistItem(props: { item: LevelRequirement }) {
  return (
    <Show
      when={isBase(props.item) ? props.item : null}
      fallback={
        <GroupItem
          item={props.item as { OR?: BaseRequirement[]; AND?: BaseRequirement[] }}
        />
      }
    >
      {(base) => (
        <div class="flex items-center gap-2">
          <span
            class={`mr-2 h-4 w-4 rounded-full ${
              base().requirement <= 0 ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span class="text-sm">
            {base().title}{" "}
            <Show when={base().requirement > 0}>
              ({compactFormat(base().requirement)} more needed)
            </Show>
          </span>
        </div>
      )}
    </Show>
  )
}

function GroupItem(props: {
  item: { OR?: BaseRequirement[]; AND?: BaseRequirement[] }
}) {
  const children = () => props.item.AND ?? props.item.OR ?? []
  const separator = () => (props.item.AND ? "(AND)" : "(OR)")
  return (
    <div>
      <For each={children()}>
        {(child, index) => (
          <>
            <ChecklistItem item={child} />
            <Show when={index() < children().length - 1}>
              <p class="ml-10 font-semibold">{separator()}</p>
            </Show>
          </>
        )}
      </For>
    </div>
  )
}

/** Requirements for reaching the next level, with met/unmet indicators. */
export default function RequirementsChecklist(props: {
  checklists: LevelRequirement[]
}) {
  return (
    <div class="mt-3 space-y-6">
      <For each={props.checklists}>{(item) => <ChecklistItem item={item} />}</For>
    </div>
  )
}
