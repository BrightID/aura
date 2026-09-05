import { Show } from 'solid-js';
import ProgressBar from '@/components/home/progress-bar';
import { useLevelupProgress } from '@/hooks/use-levelup-progress';
import { useSubjectVerifications } from '@/hooks/use-subject-verifications';
import { useViewMode } from '@/hooks/use-view-mode';
import { compactFormat } from '@/shared/lib/number';
import { EvaluationCategory } from '@aura/domain/types/evaluations';

/** Level-up progress toward the evaluator role. Hidden once unlocked. */
export default function ProfileInfoPerformance(props: { subjectId: string }) {
  const vm = useViewMode();
  const category = vm.currentRoleEvaluatorEvaluationCategory;
  const v = useSubjectVerifications(() => props.subjectId, category);
  const progress = useLevelupProgress(category);

  const percent = () => Math.max(0, Math.min(100, progress().percent));

  return (
    <Show when={!progress().isUnlocked}>
      <a-card
        variant="glass"
        data-testid="levelup-progress-card"
        class="flex flex-col gap-3 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="bg-primary/15 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <a-icon name="lock" />
            </span>
            <div class="flex flex-col">
              <p class="text-sm font-semibold text-foreground">
                Level Up locked
              </p>
              <p class="text-xs text-muted-foreground">{progress().reason}</p>
            </div>
          </div>
          <span class="bg-foreground/10 shrink-0 rounded-full px-2.5 py-1 text-xs text-muted-foreground">
            Score{' '}
            <span class="font-semibold text-foreground">
              {compactFormat(v.auraScore() ?? 0)}
            </span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <ProgressBar percentage={percent()} class="flex-1" />
          <span class="w-9 text-right text-xs font-medium text-muted-foreground">
            {Math.round(percent())}%
          </span>
        </div>

        <Show when={category() === EvaluationCategory.PLAYER}>
          <p class="text-xs text-muted-foreground">
            Evaluate subjects below to make progress.
          </p>
        </Show>
      </a-card>
    </Show>
  );
}
