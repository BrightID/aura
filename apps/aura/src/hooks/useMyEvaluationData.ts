import { getConfidenceValueOfAuraRatingObject } from '@/constants/index';
import { useMyEvaluations } from 'hooks/useMyEvaluations';
import { useMemo } from 'react';
import useViewMode from './useViewMode';
import { type EvaluationCategory } from '../types/dashboard';

export function useMyEvaluationData(props?: {
  subjectId?: string;
  evaluationCategory?: EvaluationCategory;
}) {
  const context = useMyEvaluations();
  const { currentEvaluationCategory } = useViewMode();
  const activeCategory = props?.evaluationCategory ?? currentEvaluationCategory;

  const myRatings = useMemo(
    () => context.myRatings?.filter((r) => r.category === activeCategory) ?? null,
    [context.myRatings, activeCategory],
  );

  const myRatingToSubject = useMemo(
    () => (props?.subjectId ? myRatings?.find((r) => r.toBrightId === props.subjectId) : undefined),
    [myRatings, props?.subjectId],
  );

  const myConnectionToSubject = useMemo(
    () => (props?.subjectId ? context.myConnections?.find((c) => c.id === props.subjectId) : undefined),
    [context.myConnections, props?.subjectId],
  );

  const myConfidenceValueInThisSubjectRating = useMemo(
    () => getConfidenceValueOfAuraRatingObject(myRatingToSubject),
    [myRatingToSubject],
  );

  const myRatingNumberToSubject = useMemo(
    () => (myRatingToSubject ? Number(myRatingToSubject.rating) : null),
    [myRatingToSubject],
  );

  const myActiveRatings = useMemo(() => myRatings?.filter((r) => Number(r.rating)), [myRatings]);

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
