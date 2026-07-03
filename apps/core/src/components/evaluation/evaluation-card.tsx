import { createMemo, For, Show } from "solid-js"
import { barColor } from "@/components/charts/colors"
import Avatar from "@/components/home/avatar"
import LevelScore from "@/components/shared/level-score"
import { formatDuration } from "@/shared/lib/time"
import type { InboundEvaluation } from "@/hooks/use-subject-inbound-evaluations"
import { authStore } from "@/store/auth"
import { confidenceLabel } from "@aura/domain/labels"

/** Old card's per-evaluator graph showed the evaluator's top inbound impacts. */
const MAX_IMPACT_BARS = 8

/**
 * Inbound-evaluation row: evaluator (photo, name, level), signed rating chip
 * with confidence, impact share and age.
 */
export default function EvaluationCard(props: {
  evaluation: InboundEvaluation
  onClick?: (evaluatorId: string) => void
}) {
  const e = () => props.evaluation
  const positive = () => e().rating > 0

  /** Top evaluations of the evaluator by |impact|, normalized for the strip. */
  const impactBars = createMemo(() => {
    const impacts = (e().impacts ?? [])
      .filter((i) => i.impact !== 0)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, MAX_IMPACT_BARS)
    const max = Math.max(...impacts.map((i) => Math.abs(i.impact)), 1)
    return impacts.map((i) => ({
      // Same graded palette as the big chart: red/green by signed confidence,
      // purple for the logged-in user's own bar.
      color: barColor(
        i.confidence * Math.sign(i.impact),
        i.evaluator,
        authStore.user?.brightId,
      ),
      height: Math.max(15, Math.round((Math.abs(i.impact) / max) * 100)),
    }))
  })

  return (
    <a-card
      interactive
      data-testid={`evaluation-card-${e().evaluatorId}`}
      class="flex w-full items-center justify-between gap-2 p-4"
      onClick={() => props.onClick?.(e().evaluatorId)}
    >
      <div class="flex min-w-0 items-center gap-3">
        <Avatar name={e().name} subjectId={e().evaluatorId} class="h-12 w-12" />
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="truncate font-medium text-foreground">{e().name}</p>
          <LevelScore level={e().level} score={e().score} />
          <p class="text-xs text-muted-foreground">
            {formatDuration(e().timestamp)}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-1">
        <span
          data-testid={`evaluation-card-${e().evaluatorId}-rating`}
          class={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
            positive()
              ? "bg-aura-success/15 text-aura-success"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          <a-icon name={positive() ? "thumbs-up" : "thumbs-down"} />
          {(positive() ? "+" : "") + e().rating}
          <span class="font-medium">{confidenceLabel(e().confidence)}</span>
        </span>
        <Show when={e().impactPercent !== null}>
          <span class="text-xs text-muted-foreground">
            {e().impactPercent}% of impact
          </span>
        </Show>
        <Show when={impactBars().length > 0}>
          <div
            data-testid={`evaluation-card-${e().evaluatorId}-chart`}
            title={`Top evaluations of ${e().name}`}
            class="mt-1 flex h-10 items-end gap-0.5"
          >
            <For each={impactBars()}>
              {(bar) => (
                <span
                  class="w-1.5 rounded-sm"
                  style={{ height: `${bar.height}%`, "background-color": bar.color }}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </a-card>
  )
}
