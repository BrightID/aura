import {
  getViewModeBackgroundColorClass,
  getViewModeUpArrowIcon,
  PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING,
} from '@/constants/index';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import useViewMode from 'hooks/useViewMode';
import { FC, useMemo, useState } from 'react';
import { EvaluationCategory, PreferredView } from 'types/dashboard';
import { compactFormat } from '@/utils/number';
import {
  calculateRemainingScoreToNextLevel,
  calculateUserScorePercentage,
} from '@/utils/score';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { playerLevelPoints } from '@/constants/levels';
import { LevelRequirements } from '@/types/requirement';

import RequirementsChecklist from './RequirementsChecklist';

const LevelProgress: FC<{
  category: EvaluationCategory;
  subjectId: string;
}> = ({ category, subjectId }) => {
  const { currentViewMode } = useViewMode();
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);

  const { auraLevel, auraScore, auraImpacts } = useSubjectVerifications(
    subjectId,
    category,
  );

  const remainingScore = useMemo(
    () => calculateRemainingScoreToNextLevel(category, auraScore ?? 0),
    [auraScore, category],
  );

  const isValidatedForNextLevel = useMemo(() => {
    if (category !== EvaluationCategory.PLAYER) {
      return { isPassed: true, reason: '' };
    }

    const mediumConfidenceImpacts =
      auraImpacts?.filter((item) => item.confidence > 1) ?? [];
    const highConfidenceImpacts =
      auraImpacts?.filter((item) => item.confidence > 2) ?? [];

    if (auraLevel === 1) {
      return {
        progress: 0,
        isPassed:
          mediumConfidenceImpacts.filter((item) => (item.level ?? 0) >= 1)
            .length > 0,
        reason: '1 Medium+ confidence evaluation from one level 1+ trainer',
        checklists: [
          {
            title: 'Score: 2M+',
            requirement: playerLevelPoints[2] - (auraScore ?? 0),
          },
          {
            title: '1 Medium+ confidence evaluation from one level 1+ trainer',
            requirement:
              1 -
              mediumConfidenceImpacts.filter((item) => (item.level ?? 0) >= 1)
                .length,
          },
        ],
      };
    }

    if (auraLevel === 2) {
      const hasOneHighConfidence =
        highConfidenceImpacts.filter((item) => (item.level ?? 0) >= 2).length >=
        1;
      const hasTwoMediumConfidence =
        mediumConfidenceImpacts.filter((item) => (item.level ?? 0) >= 2)
          .length >= 2;

      return {
        isPassed: hasOneHighConfidence || hasTwoMediumConfidence,
        reason: '2 Medium+ confidence evaluation from level 2+ trainers',
        progress:
          (mediumConfidenceImpacts.length + highConfidenceImpacts.length) / 3,
        checklists: [
          {
            title: 'Score: 3M+',
            requirement: playerLevelPoints[3] - (auraScore ?? 0),
          },
          {
            OR: [
              {
                title: '2 Medium+ confidence evaluation from level 2+ trainers',
                requirement: 2 - mediumConfidenceImpacts.length,
              },
              {
                title:
                  '1 High+ confidence evaluation from one level 2+ trainer',
                requirement: 1 - highConfidenceImpacts.length,
              },
            ],
          },
        ] as LevelRequirements[],
      };
    }

    return { isPassed: true, reason: '' };
  }, [category, auraImpacts, auraLevel, auraScore]);

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
    if (isValidatedForNextLevel.progress) {
      return Math.floor(isValidatedForNextLevel.progress * 100);
    }
    if (!ratingsToBeDoneCount) return 0;
    return Math.floor(
      ((PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING -
        ratingsToBeDoneCount) *
        100) /
        PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING,
    );
  }, [isValidatedForNextLevel.progress, ratingsToBeDoneCount]);

  const levelPercentage = useMemo(
    () => calculateUserScorePercentage(category, auraScore ?? 0),
    [auraScore, category],
  );

  const getLevelTextColor = () => {
    switch (currentViewMode) {
      case PreferredView.PLAYER:
        return 'text-primary-d1';
      case PreferredView.TRAINER:
        return 'text-pl2';
      case PreferredView.MANAGER_EVALUATING_TRAINER:
        return 'text-blue';
      default:
        return 'text-gray100';
    }
  };

  const renderLevelProgressText = () => {
    if (ratingsToBeDoneCount === undefined) return '...';

    if ((auraLevel ?? 0) < 0) {
      return (
        <>
          <span className="text-xl font-black">
            {compactFormat(Math.abs(auraScore ?? 0))}
          </span>
          <span className="text-lg font-medium">to</span>
          <span className={`text-lg font-semibold ${getLevelTextColor()}`}>
            Level 1
          </span>
        </>
      );
    }

    if (remainingScore > 0) {
      return (
        <>
          <span className="text-xl font-black">
            {compactFormat(remainingScore)}
          </span>
          <span className="text-lg font-medium">to</span>
          <span
            className={`whitespace-nowrap text-lg font-semibold ${getLevelTextColor()}`}
          >
            Level {(auraLevel ?? 0) + 1}
          </span>
        </>
      );
    }

    if (isValidatedForNextLevel.isPassed) {
      return (
        <span className="font-semibold">
          {"You've reached the maximum level! 🎉"}
        </span>
      );
    }

    return (
      <>
        <p className="break-words text-sm">
          {isValidatedForNextLevel.reason}

          {!!isValidatedForNextLevel.checklists?.length && (
            <>
              <small
                className="ml-2 cursor-pointer font-semibold underline"
                onClick={() => setIsRequirementsModalOpen(true)}
              >
                more
              </small>

              <Dialog
                open={isRequirementsModalOpen}
                onOpenChange={setIsRequirementsModalOpen}
              >
                <DialogContent aria-describedby="Levelup requirements">
                  <DialogTitle>Requirements for the next level</DialogTitle>
                  <RequirementsChecklist
                    checklists={isValidatedForNextLevel.checklists}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </p>
        <span className="text-lg font-medium">to</span>
        <span
          className={`w-24 whitespace-nowrap text-lg font-semibold ${getLevelTextColor()}`}
        >
          Level {(auraLevel ?? 0) + 1}
        </span>
      </>
    );
  };

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
          <div className="flex flex-row items-center gap-1">
            {renderLevelProgressText()}
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
              style={{
                width: `${
                  remainingScore > 0 || isValidatedForNextLevel.progress
                    ? progressPercentage
                    : levelPercentage
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;
