import { createEffect, Show } from 'solid-js';
import ImpactStrip from '@/components/charts/impact-strip';
import Avatar from '@/components/home/avatar';
import LevelScore from '@/components/shared/level-score';
import { formatDuration } from '@/shared/lib/time';
import type { InboundEvaluation } from '@/hooks/use-subject-inbound-evaluations';
import { confidenceLabel } from '@aura/domain/labels';

/**
 * Inbound-evaluation row: evaluator (photo, name, level), signed rating chip
 * with confidence, impact share and age.
 */
export default function EvaluationCard(props: {
  evaluation: InboundEvaluation;
  onClick?: (evaluatorId: string) => void;
}) {
  const e = () => props.evaluation;
  const positive = () => e().rating > 0;

  return (
    <a-card
      interactive={!!props.onClick}
      role={props.onClick ? 'button' : undefined}
      ref={(card) =>
        createEffect(() => {
          // Solid's custom-element tabindex prop does not set native focusability.
          card.tabIndex = props.onClick ? 0 : -1;
        })
      }
      aria-label={
        props.onClick ? `View evaluation details for ${e().name}` : undefined
      }
      data-testid={`evaluation-card-${e().evaluatorId}`}
      class="w-full p-4"
      onClick={() => props.onClick?.(e().evaluatorId)}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.target !== event.currentTarget || !props.onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          props.onClick(e().evaluatorId);
        }
      }}
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            name={e().name}
            subjectId={e().evaluatorId}
            class="h-12 w-12"
          />
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="truncate font-medium text-foreground" title={e().name}>
              {e().name}
            </p>
            <LevelScore level={e().level} score={e().score} />
            <p class="text-xs text-muted-foreground">
              {formatDuration(e().timestamp)}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
          <div class="flex min-w-0 flex-col items-start gap-1 sm:items-end">
            <span
              data-testid={`evaluation-card-${e().evaluatorId}-rating`}
              class={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                positive()
                  ? 'bg-aura-success/15 text-emerald-700 dark:text-aura-success'
                  : 'bg-destructive/15 text-red-700 dark:text-red-400'
              }`}
            >
              <a-icon name={positive() ? 'thumbs-up' : 'thumbs-down'} />
              {(positive() ? '+' : '') + e().rating}
              <span class="font-medium">{confidenceLabel(e().confidence)}</span>
            </span>
            <Show when={e().impactPercent !== null}>
              <span class="text-xs text-muted-foreground">
                {e().impactPercent}% of impact
              </span>
            </Show>
          </div>
          <ImpactStrip
            impacts={() => e().impacts}
            class="mt-1 h-10"
            title={`Top evaluations of ${e().name}`}
            testid={`evaluation-card-${e().evaluatorId}-chart`}
          />
        </div>
      </div>
    </a-card>
  );
}
