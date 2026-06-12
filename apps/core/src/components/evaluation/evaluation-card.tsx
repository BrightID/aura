import { Show } from "solid-js"
import Avatar from "@/components/home/avatar"
import { compactFormat } from "@/shared/lib/number"
import { formatDuration } from "@/shared/lib/time"
import type { InboundEvaluation } from "@/hooks/use-subject-inbound-evaluations"
import { confidenceLabel } from "@aura/domain/labels"

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
          <p class="text-sm text-muted-foreground">
            <Show when={e().level !== null}>
              Level <span class="font-medium text-foreground">{e().level}</span>
              <span class="mx-1">·</span>
            </Show>
            <Show when={e().score !== null}>
              <span class="font-medium text-foreground">
                {compactFormat(e().score!)}
              </span>
              <span class="mx-1">·</span>
            </Show>
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
      </div>
    </a-card>
  )
}
