import BrightIdProfilePicture from '@/components/Shared/BrightIdProfilePicture';
import { useSubjectName } from 'hooks/useSubjectName';
import { useSubjectVerifications } from 'hooks/useSubjectVerifications';
import { getViewModeSubjectBorderColorClass } from '@/constants/index';
import { useProfileStore } from '@/store/profile.store';

import useViewMode from '../../hooks/useViewMode';

const EvaluateOverlayCard = ({
  className,
  isPerformance = false,
  subjectId,
  setShowEvaluationFlow,
}: {
  className?: string;
  isPerformance?: boolean;
  subjectId: string | undefined;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  const { currentEvaluationCategory, currentViewMode } = useViewMode();
  const { auraLevel } = useSubjectVerifications(
    subjectId,
    currentEvaluationCategory,
  );
  const authData = useProfileStore((s) => s.authData);
  const name = useSubjectName(subjectId);

  if (authData?.brightId === subjectId) return null;

  return (
    <div className={`card border bg-card text-card-foreground ${className}`}>
      <div className="card--header flex w-full items-center justify-between">
        <div className="card--header__left flex gap-4">
          <BrightIdProfilePicture
            className={`card--header__left__avatar rounded-full border-[3px] ${getViewModeSubjectBorderColorClass(currentViewMode)} h-[51px] w-[51px]`}
            subjectId={subjectId}
          />
          <div className="card--header__left__info flex flex-col justify-center">
            <h3 className="text-lg font-medium leading-5">{name}</h3>
            <div className="leading-5">
              {isPerformance ? (
                <>
                  <span>Player Level: </span>
                  <span className="font-medium">1</span>
                </>
              ) : auraLevel ? (
                <>
                  <span className="font-medium">{auraLevel} </span>
                  <span>Subject</span>
                </>
              ) : (
                <span className="font-medium">Loading...</span>
              )}
            </div>
          </div>
        </div>
        <div
          onClick={() => setShowEvaluationFlow(true)}
          className="btn flex min-w-[90px] cursor-pointer flex-col items-center justify-center rounded-md py-2"
        >
          <img
            src="/assets/images/SubjectProfile/subject-evaluation.svg"
            alt=""
          />
          <p className="font-medium">Evaluate</p>
        </div>
      </div>
    </div>
  );
};

export default EvaluateOverlayCard;
