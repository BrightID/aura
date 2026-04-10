import EvaluateModalBody from 'components/EvaluationFlow/EvaluateModalBody';
import { PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING } from '@/constants/index';
import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import { useSubjectInboundEvaluationsContext } from 'contexts/SubjectInboundEvaluationsContext';
import { useSubjectName } from 'hooks/useSubjectName';
import { useCallback, useEffect, useState } from 'react';

import useViewMode from '../../hooks/useViewMode';
import { EvaluationCategory, PreferredView } from '../../types/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useDispatch } from '@/store/hooks';
import { connectionsApi } from '@/store/api/connections';
import { profileApi } from '@/store/api/profile';

const EvaluationFlow = ({
  showEvaluationFlow,
  subjectId,
  setShowEvaluationFlow,
  currentViewMode: preferredView,
  refresh,
  evaluationCategory,
}: {
  subjectId: string;
  showEvaluationFlow: boolean;
  setShowEvaluationFlow: (value: boolean) => void;
  currentViewMode?: PreferredView;
  refresh?: () => void;
  evaluationCategory?: EvaluationCategory;
}) => {
  const name = useSubjectName(subjectId);

  const { refreshInboundRatings, myRatingObject } =
    useSubjectInboundEvaluationsContext({ subjectId });
  const { refreshOutboundRatings, myRatings } = useMyEvaluationsContext({
    subjectId,
  });

  const [myNewRatingCount, setMyNewRatingCount] = useState<number | null>(null);
  const { currentViewMode: pageCurrentViewMode } = useViewMode();

  const currentViewMode = preferredView ?? pageCurrentViewMode;

  const onSubmitted = useCallback(
    async (newRating: number | null | undefined) => {
      const myRatingsCount = myRatings?.filter((r) => Number(r.rating)).length;

      refreshInboundRatings();
      refreshOutboundRatings();
      if (!newRating) {
        setShowEvaluationFlow(false);
        return;
      }
      if (myRatingsCount === undefined) return;
      const isNewRating = !(myRatingObject && Number(myRatingObject.rating));
      const newRatingCount = myRatingsCount + (isNewRating ? 1 : 0);
      if (
        currentViewMode !== PreferredView.PLAYER ||
        newRatingCount > PLAYER_EVALUATION_MINIMUM_COUNT_BEFORE_TRAINING
      ) {
        setShowEvaluationFlow(false);
      } else {
        setMyNewRatingCount(newRatingCount);
        refresh?.();
      }
    },
    [
      refresh,
      currentViewMode,
      myRatingObject,
      myRatings,
      refreshInboundRatings,
      refreshOutboundRatings,
      setShowEvaluationFlow,
    ],
  );

  useEffect(() => {
    const myRating = myRatings?.find((r) => r.toBrightId === subjectId);
    if (myRating) {
      setMyNewRatingCount(Number(myRating.rating));
    }
  }, [myRatings, subjectId]);

  return (
    <Dialog
      open={showEvaluationFlow}
      onOpenChange={(e) => {
        setShowEvaluationFlow(e);
        if (!e) setMyNewRatingCount(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {myNewRatingCount === null ? `Evaluating ${name}` : undefined}
          </DialogTitle>
        </DialogHeader>
        <EvaluateModalBody
          subjectId={subjectId}
          viewMode={currentViewMode}
          evaluationCategory={evaluationCategory}
          onSubmitted={onSubmitted}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationFlow;
