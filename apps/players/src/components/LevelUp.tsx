import * as React from 'react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { useSubjectInboundEvaluationsContext } from '../contexts/SubjectInboundEvaluationsContext';
import useViewMode from '../hooks/useViewMode';
import { selectAuthData } from '../store/profile/selectors';
import { PreferredView } from '../types/dashboard';
import FindTrainersCard from './Shared/FindTrainersCard';
import EvaluationsDetailsPerformance from '@/app/routes/_app.home/components/EvaluationsDetailsPerformance';

export default function LevelUp({ subjectId }: { subjectId: string }) {
  const authData = useSelector(selectAuthData);

  const { currentViewMode, currentRoleEvaluatorEvaluationCategory } =
    useViewMode();

  const {
    itemsOriginal: evaluationsOriginal,
    loading: loadingInboundEvaluations,
  } = useSubjectInboundEvaluationsContext({
    subjectId,
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  });

  const [forceShowFindTrainers, setForceShowFindTrainers] = useState(false);
  const showFindTrainers = useMemo(
    () =>
      forceShowFindTrainers ||
      (currentViewMode === PreferredView.PLAYER &&
        !loadingInboundEvaluations &&
        !evaluationsOriginal?.filter((e) => Number(e.rating?.rating)).length),
    [
      currentViewMode,
      evaluationsOriginal,
      forceShowFindTrainers,
      loadingInboundEvaluations,
    ],
  );

  if (!authData) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/*<ActivitiesCard />*/}
      {showFindTrainers ? (
        <FindTrainersCard subjectId={subjectId} />
      ) : (
        <EvaluationsDetailsPerformance
          subjectId={subjectId}
          title={`Evaluation by ${currentRoleEvaluatorEvaluationCategory.slice(0, 1).toUpperCase() +
            currentRoleEvaluatorEvaluationCategory.slice(1)
            }`}
          hasHeader={true}
          hasBtn={true}
          onFindEvaluatorsButtonClick={() => setForceShowFindTrainers(true)}
        />
      )}
    </div>
  );
}
