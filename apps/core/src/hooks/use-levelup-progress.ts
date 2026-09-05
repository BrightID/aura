import { createMemo } from 'solid-js';
import { useMyEvaluations } from '@/hooks/use-my-evaluations';
import { useSubjectVerifications } from '@/hooks/use-subject-verifications';
import { authStore } from '@/store/auth';
import { EvaluationCategory } from '@aura/domain/types/evaluations';

const PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING = 3;

export interface LevelupProgress {
  isUnlocked: boolean;
  reason: string;
  percent: number;
}

export function useLevelupProgress(category: () => EvaluationCategory) {
  const subjectId = () => authStore.user?.brightId ?? '';
  const playerEval = useSubjectVerifications(
    subjectId,
    () => EvaluationCategory.PLAYER,
  );
  const trainerEval = useSubjectVerifications(
    subjectId,
    () => EvaluationCategory.TRAINER,
  );
  const { myRatings } = useMyEvaluations();

  const ratingsToBeDone = createMemo(() => {
    const r = myRatings();
    if (!r) return undefined;
    return Math.max(
      PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING -
        r.filter((x) => Number(x.rating)).length,
      0,
    );
  });

  return createMemo<LevelupProgress>(() => {
    switch (category()) {
      case EvaluationCategory.PLAYER: {
        const todo = ratingsToBeDone() ?? 0;
        return {
          isUnlocked: todo <= 0,
          reason: `${todo} more evaluation${todo > 1 ? 's' : ''} to unlock Level Up`,
          percent:
            ((myRatings()?.length ?? 0) /
              PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING) *
            100,
        };
      }
      case EvaluationCategory.TRAINER: {
        const lvl = playerEval.auraLevel();
        return {
          isUnlocked: !!lvl && lvl >= 2,
          reason: 'Reach Player level 2 to unlock',
          percent: lvl ?? 0,
        };
      }
      case EvaluationCategory.MANAGER: {
        const lvl = trainerEval.auraLevel();
        return {
          isUnlocked: !!lvl && lvl >= 1,
          reason: 'Reach Trainer level 1 to unlock',
          percent: lvl ?? 0,
        };
      }
      default:
        return { isUnlocked: false, reason: '', percent: 0 };
    }
  });
}
