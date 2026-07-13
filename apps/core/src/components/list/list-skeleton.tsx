import { For } from "solid-js"
import Skeleton from "@/components/shared/skeleton"

/**
 * Placeholder rows shown while a subject / evaluation / connection list loads.
 * Shape mirrors a card row (avatar + name/level/bar + trailing action) so the
 * layout doesn't jump when the real data arrives.
 */
export default function ListSkeleton(props: { rows?: number }) {
  return (
    <div class="flex flex-col gap-3" data-testid="list-skeleton">
      <For each={Array.from({ length: props.rows ?? 4 })}>
        {() => (
          <div class="flex items-center gap-3 rounded-xl border border-border p-4">
            <Skeleton class="h-12 w-12 shrink-0 rounded-full" />
            <div class="flex flex-1 flex-col gap-2">
              <Skeleton class="h-4 w-1/3" />
              <Skeleton class="h-3 w-1/4" />
              <Skeleton class="mt-1 h-2 w-36 rounded-full" />
            </div>
            <Skeleton class="h-8 w-16 shrink-0 rounded-lg" />
          </div>
        )}
      </For>
    </div>
  )
}
