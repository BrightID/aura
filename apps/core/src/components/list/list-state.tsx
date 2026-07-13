import { type JSX, Show } from "solid-js"
import ListSkeleton from "@/components/list/list-skeleton"

/** Shared loading / empty / content scaffolding for list views. */
export default function ListState(props: {
  loading: boolean
  empty: boolean
  emptyText: string
  children: JSX.Element
  /** Override the loading placeholder (defaults to skeleton rows). */
  skeleton?: JSX.Element
}) {
  return (
    <Show
      when={!props.loading}
      fallback={props.skeleton ?? <ListSkeleton />}
    >
      <Show
        when={!props.empty}
        fallback={
          <div class="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <a-icon name="inbox" class="text-2xl opacity-60" />
            <span class="text-sm">{props.emptyText}</span>
          </div>
        }
      >
        {props.children}
      </Show>
    </Show>
  )
}
