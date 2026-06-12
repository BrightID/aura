import { type JSX, Show } from "solid-js"

/** Shared loading / empty / content scaffolding for list views. */
export default function ListState(props: {
  loading: boolean
  empty: boolean
  emptyText: string
  children: JSX.Element
}) {
  return (
    <Show
      when={!props.loading}
      fallback={<div class="py-8 text-center text-muted-foreground">Loading…</div>}
    >
      <Show
        when={!props.empty}
        fallback={
          <div class="py-8 text-center text-muted-foreground">
            {props.emptyText}
          </div>
        }
      >
        {props.children}
      </Show>
    </Show>
  )
}
