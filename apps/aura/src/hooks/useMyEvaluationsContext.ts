import { getConfidenceValueOfAuraRatingObject } from '@/constants/index';
import { useMyEvaluations } from 'hooks/useMyEvaluations';
import { useMemo } from 'react';
import useViewMode from './useViewMode';
import { type EvaluationCategory } from '../types/dashboard';

export function useMyEvaluationsContext(props?: {
  subjectId?: string;
  evaluationCategory?: EvaluationCategory;
}) {
  const context = useMyEvaluations();
  const { currentEvaluationCategory } = useViewMode();

  const myRatings = useMemo(() => {
    if (!context.myRatings) return null;
    return context.myRatings.filter(
      (r) => r.category === (props?.evaluationCategory ?? currentEvaluationCategory),
    );
  }, [context.myRatings, currentEvaluationCategory, props?.evaluationCategory]);

  const myRatingToSubject = useMemo(() => {
    if (!props?.subjectId || !myRatings) return undefined;
    return myRatings.find((r) => r.toBrightId === props.subjectId);
  }, [myRatings, props?.subjectId]);

  const myConnectionToSubject = useMemo(() => {
    if (!props?.subjectId || !context.myConnections) return undefined;
    return context.myConnections.find((c) => c.id === props.subjectId);
  }, [context.myConnections, props?.subjectId]);

  const myConfidenceValueInThisSubjectRating = useMemo(
    () => getConfidenceValueOfAuraRatingObject(myRatingToSubject),
    [myRatingToSubject],
  );

  const myRatingNumberToSubject = useMemo(
    () => (myRatingToSubject ? Number(myRatingToSubject.rating) : null),
    [myRatingToSubject],
  );

  const myActiveRatings = useMemo(
    () => myRatings?.filter((r) => Number(r.rating)),
    [myRatings],
  );

  const myLastRating = useMemo(
    () => (myActiveRatings ? myActiveRatings[myActiveRatings.length - 1] : undefined),
    [myActiveRatings],
  );

  return {
    ...context,
    myRatings,
    myLastRating,
    myRatingToSubject,
    myConnectionToSubject,
    myConfidenceValueInThisSubjectRating,
    myRatingNumberToSubject,
  };
}
