import {
  getViewModeBackgroundColorClass,
  getViewModeUpArrowIcon,
  PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING,
} from '@/constants/index';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import useViewMode from 'hooks/useViewMode';
import { useMemo } from 'react';
import { compactFormat } from '@/utils/number';
import { useLevelupProgress } from '@/utils/score';

const ProfileInfoPerformance = ({
  subjectId,
  isPerformance,
  color = 'pastel-green',
}: {
  subjectId: string;
  isPerformance: boolean;
  color: string;
}) => {
  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode();
  const { auraLevel, auraScore } = useSubjectVerifications(
    subjectId,
    currentRoleEvaluatorEvaluationCategory,
  );
  const { isUnlocked, reason, percent } = useLevelupProgress({
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  });

  const { myRatings } = useMyEvaluationsContext();
  const ratingsToBeDoneCount = useMemo(
    () =>
      myRatings
        ? Math.max(
            PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING -
              myRatings.filter((r) => Number(r.rating)).length,
            0,
          )
        : undefined,
    [myRatings],
  );

  const progressPercentage = useMemo(() => {
    if (ratingsToBeDoneCount) {
      return Math.floor(
        ((PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING -
          ratingsToBeDoneCount) *
          100) /
          PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING,
      );
    }
    return percent;
  }, [percent, ratingsToBeDoneCount]);

  if (isUnlocked) return null;

  return (
    <div className="card relative dark:bg-dark-primary">
      <div className="absolute right-0 top-0">
        <img src={getViewModeUpArrowIcon(currentViewMode)} alt="" />
      </div>
      <div className="flex w-full flex-row items-end gap-4">
        {ratingsToBeDoneCount === 0 && (
          <div
            className={`flex flex-col items-center gap-1 rounded-[6px] bg-opacity-50 ${getViewModeBackgroundColorClass(
              currentViewMode,
            )} px-2.5 py-2`}
          >
            <div className="text-sm font-bold">Level</div>
            <div className="text-center text-2xl font-black leading-6">
              {auraLevel ?? '-'}
            </div>
          </div>
        )}
        <div className="flex w-full flex-col gap-3.5">
          <div className="flex flex-row items-end gap-1">
            {reason === undefined ? (
              '...'
            ) : (
              <>
                <span className="text-lg font-medium">{reason}</span>
              </>
            )}
          </div>
          <div className="relative mb-3 h-4 w-full rounded-full bg-gray30 dark:bg-button-primary">
            <small className="absolute top-full mt-1">
              score:{' '}
              <span className="font-semibold">
                {compactFormat(auraScore ?? 0)}
              </span>
            </small>
            <div
              className={`absolute ${getViewModeBackgroundColorClass(
                currentViewMode,
              )} h-full rounded-full`}
              style={{ width: progressPercentage + '%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoPerformance;
