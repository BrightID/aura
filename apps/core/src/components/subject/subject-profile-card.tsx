import { Show } from 'solid-js';
import Avatar from '@/components/home/avatar';
import LevelScore from '@/components/shared/level-score';
import { useSubjectName } from '@/hooks/use-backup';
import { useMyRating } from '@/hooks/use-my-evaluations';
import { useSubjectVerifications } from '@/hooks/use-subject-verifications';
import { useViewMode } from '@/hooks/use-view-mode';
import { confidenceLabel } from '@aura/domain/labels';

/** Subject header card: identity, standing, your evaluation, evaluate action. */
export default function SubjectProfileCard(props: {
  subjectId: () => string;
  onEvaluate: () => void;
  /** Display name for ids the backup can't resolve (e.g. from `?name=`). */
  fallbackName?: () => string | undefined;
  /** Photo URL for ids the backup can't resolve (e.g. from `?gravatar=`). */
  fallbackPhoto?: () => string | undefined;
}) {
  const name = useSubjectName(props.subjectId, props.fallbackName);
  const vm = useViewMode();
  const v = useSubjectVerifications(
    props.subjectId,
    vm.currentEvaluationCategory,
  );
  const my = useMyRating(props.subjectId, vm.currentEvaluationCategory);

  return (
    <a-card class="flex flex-col gap-3 p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Avatar
            name={name()}
            subjectId={props.subjectId()}
            class="h-14 w-14"
            fallbackSrc={props.fallbackPhoto?.()}
          />
          <div class="flex flex-col gap-1">
            <p data-testid="subject-name" class="font-medium text-foreground">
              {name()}
            </p>
            <LevelScore
              level={v.auraLevel()}
              score={v.auraScore()}
              testid="subject"
            />
          </div>
        </div>
        <a-button
          size="sm"
          data-testid="subject-evaluate"
          onClick={props.onEvaluate}
        >
          <Show when={my.rating() !== undefined} fallback="Evaluate">
            Edit
          </Show>
        </a-button>
      </div>

      <div class="text-sm text-muted-foreground">
        Your evaluation:{' '}
        <Show when={my.rating() !== undefined} fallback={<span>-</span>}>
          <span
            class={`font-medium ${my.rating()! > 0 ? 'text-aura-success' : 'text-destructive'}`}
          >
            {my.rating()! > 0 ? 'Positive' : 'Negative'} —{' '}
            {confidenceLabel(my.rating()!)} ({my.rating()! > 0 ? '+' : ''}
            {my.rating()})
          </span>
        </Show>
      </div>
    </a-card>
  );
}
