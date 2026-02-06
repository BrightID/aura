import BrightIdProfilePicture from 'components/BrightIdProfilePicture';
import { HorizontalProgressBar } from 'components/Shared/HorizontalProgressBar';
import {
  getViewModeSubjectBorderColorClass,
  viewModeToString,
} from '@/constants/index';
import { useSubjectName } from 'hooks/useSubjectName';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import useViewMode from 'hooks/useViewMode';
import { FC } from 'react';
import { compactFormat } from '@/utils/number';
import { calculateUserScorePercentage } from '@/utils/score';

import { Card } from '@/components/ui/card';
import { Link } from 'react-router';

const ProfileHeaderCard: FC<{
  subjectId: string;
}> = ({ subjectId }) => {
  const name = useSubjectName(subjectId);
  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode();

  const { auraLevel, auraScore, loading } = useSubjectVerifications(
    subjectId,
    currentRoleEvaluatorEvaluationCategory,
  );

  const progress = calculateUserScorePercentage(
    currentRoleEvaluatorEvaluationCategory,
    auraScore ?? 0,
  );

  return (
    <Link
      to={`/subject/${subjectId}?viewas=${viewModeToString[currentViewMode].toLowerCase()}`}
    >
      <Card className="relative p-4">
        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-1 gap-3">
            <BrightIdProfilePicture
              className={`h-16 w-16 rounded-full border-2 ${getViewModeSubjectBorderColorClass(
                currentViewMode,
              )} bg-cover bg-center`}
              subjectId={subjectId}
            />
            <div className="evaluation__info flex flex-1 flex-col">
              <p
                data-testid="profile-name"
                className="font-medium text-black dark:text-white"
              >
                {name}
              </p>

              <div className="text-gray10 dark:text-gray70">
                Level:{' '}
                <span
                  data-testid="profile-level"
                  className="font-medium text-black dark:text-white"
                >
                  {auraLevel}
                </span>
                <span className="mt-2 text-sm">
                  <p className="text-gray10 dark:text-gray70">
                    Score:{' '}
                    <span
                      data-testid="profile-score"
                      className="font-medium text-black dark:text-white"
                    >
                      {auraScore ? compactFormat(auraScore) : '-'}
                    </span>
                  </p>
                </span>
              </div>
              {progress < 0 ? (
                '😈'
              ) : (
                <HorizontalProgressBar
                  data-testid="profile-progressbar"
                  className="w-full"
                  percentage={progress}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileHeaderCard;
