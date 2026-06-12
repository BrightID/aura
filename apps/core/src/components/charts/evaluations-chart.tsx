import { createMemo, For, Show } from "solid-js"
import { barColor } from "@/components/charts/colors"
import Avatar from "@/components/home/avatar"
import { useNameResolver } from "@/hooks/use-backup"
import { authStore } from "@/store/auth"
import type { AuraImpactRaw } from "@aura/domain/types/aura"

// Old chart showed evaluator pictures for up to 20 bars, 16–40px by count.
const MAX_AVATARS = 20
const avatarSize = (count: number) =>
  Math.round(40 - ((40 - 16) / (MAX_AVATARS - 1)) * (count - 1))

interface Bar {
  id: string
  name: string
  /** Share of the subject's total absolute impact, signed (-100..100). */
  percent: number
  /** Bar height inside its half of the plot, normalized to the max (0..100). */
  height: number
  color: string
}

/**
 * Evaluation-impacts chart (plan T2.5) — the old recharts chart rebuilt as
 * plain CSS bars: one bar per evaluator, height = share of the subject's
 * total impact, negatives below the baseline. Bars use the old confidence
 * palettes (purple = you, orange = the focused subject) and carry the
 * evaluator's picture underneath when the list is small enough. Click opens
 * the evaluator. The old drag-zoom is dropped — the strip scrolls instead.
 */
export default function EvaluationsChart(props: {
  impacts: () => AuraImpactRaw[] | null
  onBarClick?: (evaluatorId: string) => void
  /** Highlighted subject (orange palette), e.g. the profile being viewed. */
  focusedSubjectId?: () => string
}) {
  const nameOf = useNameResolver()

  const bars = createMemo<Bar[]>(() => {
    const impacts = (props.impacts() ?? []).filter((i) => i.impact !== 0)
    const total = impacts.reduce((sum, i) => sum + Math.abs(i.impact), 0)
    if (!total) return []
    const maxAbs = Math.max(...impacts.map((i) => Math.abs(i.impact)))
    return [...impacts]
      .sort((a, b) => a.impact - b.impact)
      .map((i) => ({
        id: i.evaluator,
        name: nameOf(i.evaluator),
        percent: (i.impact / total) * 100,
        height: Math.max(8, Math.round((Math.abs(i.impact) / maxAbs) * 100)),
        color: barColor(
          i.confidence * Math.sign(i.impact),
          i.evaluator,
          authStore.user?.brightId,
          props.focusedSubjectId?.(),
        ),
      }))
  })

  const showAvatars = () => bars().length <= MAX_AVATARS

  return (
    <Show
      when={bars().length > 0}
      fallback={
        <div class="py-6 text-center text-sm text-muted-foreground">
          No evaluation impacts yet.
        </div>
      }
    >
      <div
        data-testid="evaluations-chart"
        class="flex items-stretch gap-1 overflow-x-auto pb-1"
      >
        <For each={bars()}>
          {(bar) => (
            <button
              type="button"
              data-testid={`evaluations-chart-bar-${bar.id}`}
              title={`${bar.name}: ${bar.percent > 0 ? "+" : ""}${bar.percent.toFixed(1)}%`}
              onClick={() => props.onBarClick?.(bar.id)}
              class="flex min-w-3 flex-1 cursor-pointer flex-col items-center gap-1 opacity-90 transition-opacity hover:opacity-100"
            >
              <span class="flex h-36 w-full flex-col">
                {/* positive half */}
                <span class="flex flex-1 items-end justify-center">
                  <Show when={bar.percent > 0}>
                    <span
                      class="w-full rounded-t-sm"
                      style={{
                        height: `${bar.height}%`,
                        "background-color": bar.color,
                      }}
                    />
                  </Show>
                </span>
                <span class="border-border block border-t" />
                {/* negative half */}
                <span class="flex flex-1 items-start justify-center">
                  <Show when={bar.percent < 0}>
                    <span
                      class="w-full rounded-b-sm"
                      style={{
                        height: `${bar.height}%`,
                        "background-color": bar.color,
                      }}
                    />
                  </Show>
                </span>
              </span>
              <Show when={showAvatars()}>
                <Avatar
                  name={bar.name}
                  subjectId={bar.id}
                  noHover
                  class="text-[10px]"
                  style={{
                    width: `${avatarSize(bars().length)}px`,
                    height: `${avatarSize(bars().length)}px`,
                  }}
                />
              </Show>
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}
