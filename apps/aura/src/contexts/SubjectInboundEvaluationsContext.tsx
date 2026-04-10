import useFilterAndSort from 'hooks/useFilterAndSort';
import {
  AuraFilterId,
  AuraFilterOptions,
  useInboundEvaluationsFilters,
} from 'hooks/useFilters';
import {
  AuraSortId,
  AuraSortOptions,
  useInboundEvaluationsSorts,
} from 'hooks/useSorts';
import { useInboundEvaluations } from 'hooks/useSubjectEvaluations';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { selectAuthData, selectBrightIdBackup } from 'store/profile/selectors';
import { AuraInboundConnectionAndRatingData, AuraRating } from 'types';

import { viewAsToEvaluatorViewAs } from '../constants';
import { getAuraVerification } from '../hooks/useParseBrightIdVerificationData';
import useViewMode from '../hooks/useViewMode';
import { EvaluationCategory } from '../types/dashboard';
import { useRefreshEvaluationsContext } from './RefreshEvaluationsContext';
import { Verifications } from '@/api/auranode.service';

type SubjectInboundEvaluationsContextType = ReturnType<
  typeof useInboundEvaluations
> & {
  subjectId: string;
} & ReturnType<typeof useFilterAndSort<AuraInboundConnectionAndRatingData>> & {
    sorts: AuraSortOptions<AuraInboundConnectionAndRatingData>;
    filters: AuraFilterOptions<AuraInboundConnectionAndRatingData>;
  };
// Define the context
export const SubjectInboundEvaluationsContext =
  createContext<SubjectInboundEvaluationsContextType | null>(null);

interface ProviderProps {
  subjectId: string;
  children: ReactNode;
}

// Define the Provider component
export const SubjectInboundEvaluationsContextProvider: React.FC<
  ProviderProps
> = ({ subjectId, children }) => {
  const { refreshInboundRatings, ...useSubjectInboundEvaluationsHookData } =
    useInboundEvaluations({
      subjectId,
    });
  const { ratings, connections } = useSubjectInboundEvaluationsHookData;
  const filters = useInboundEvaluationsFilters(
    [
      // AuraFilterId.EvaluationMutualConnections,
      AuraFilterId.EvaluationPositiveEvaluations,
      AuraFilterId.EvaluationNegativeEvaluations,
      AuraFilterId.EvaluationConfidenceLow,
      AuraFilterId.EvaluationConfidenceMedium,
      AuraFilterId.EvaluationConfidenceHigh,
      AuraFilterId.EvaluationConfidenceVeryHigh,
      AuraFilterId.EvaluationEvaluatorLevelNegative,
      AuraFilterId.EvaluationEvaluatorLevelZero,
      AuraFilterId.EvaluationEvaluatorLevelOne,
      AuraFilterId.EvaluationEvaluatorLevelTwo,
      AuraFilterId.EvaluationEvaluatorLevelThree,
      AuraFilterId.EvaluationEvaluatorLevelFour,
    ],
    subjectId,
  );

  const sorts = useInboundEvaluationsSorts([
    AuraSortId.RecentEvaluation,
    AuraSortId.EvaluationConfidence,
    AuraSortId.EvaluatorScore,
  ]);

  const brightIdBackup = useSelector(selectBrightIdBackup);

  const inboundOpinions: AuraInboundConnectionAndRatingData[] = useMemo(() => {
    const inboundConnections = connections;
    if (!inboundConnections || ratings === null || !brightIdBackup) return [];
    const inboundOpinions: AuraInboundConnectionAndRatingData[] = ratings.map(
      (r) => ({
        fromSubjectId: r.fromBrightId,
        rating: r,
        name: brightIdBackup.connections.find(
          (conn) => conn.id === r.fromBrightId,
        )?.name,
        inboundConnection: inboundConnections.find(
          (c) => c.id === r.fromBrightId,
        ),
        verifications: r.verifications!,
      }),
    );
    inboundConnections.forEach((c) => {
      const notRated = ratings.findIndex((r) => r.fromBrightId === c.id) === -1;
      if (notRated) {
        inboundOpinions.push({
          fromSubjectId: c.id,
          name: brightIdBackup.connections.find((conn) => conn.id === c.id)
            ?.name,
          inboundConnection: c,
          verifications: c.verifications,
        });
      }
    });
    return inboundOpinions.sort(
      (a, b) =>
        ((b.inboundConnection &&
          b.rating &&
          getAuraVerification(
            b.inboundConnection.verifications,
            viewAsToEvaluatorViewAs[b.rating.category],
          )?.level) ||
          0) -
        ((a.inboundConnection &&
          a.rating &&
          getAuraVerification(
            a.inboundConnection.verifications,
            viewAsToEvaluatorViewAs[a.rating.category],
          )?.level) ||
          0),
    );
  }, [brightIdBackup, ratings, connections]);

  const filterAndSortHookData = useFilterAndSort(
    inboundOpinions,
    filters,
    sorts,
    useMemo(() => ['fromSubjectId', 'name'], []),
    'evaluation|' + subjectId,
  );

  const { refreshCounter } = useRefreshEvaluationsContext();
  useEffect(() => {
    if (refreshCounter > 0) {
      refreshInboundRatings();
    }
  }, [refreshCounter, refreshInboundRatings]);

  return (
    <SubjectInboundEvaluationsContext.Provider
      value={{
        refreshInboundRatings,
        ...useSubjectInboundEvaluationsHookData,
        ...filterAndSortHookData,
        sorts,
        filters,
        subjectId,
      }}
    >
      {children}
    </SubjectInboundEvaluationsContext.Provider>
  );
};

export const useSubjectInboundEvaluationsContext = (props: {
  subjectId: string;
  evaluationCategory?: EvaluationCategory;
}): SubjectInboundEvaluationsContextType & {
  myRatingObject: AuraRating | undefined;
} => {
  const context = useContext(SubjectInboundEvaluationsContext);
  if (context === null) {
    throw new Error(
      'SubjectInboundEvaluationsContext must be used within a SubjectInboundEvaluationsContextProvider',
    );
  }
  if (context.subjectId !== props.subjectId) {
    throw new Error(
      'SubjectInboundEvaluationsContextProvider for ' +
        props.subjectId +
        'not provided',
    );
  }

  const { currentEvaluationCategory } = useViewMode();
  const ratings = useMemo(
    () =>
      context.ratings
        ? context.ratings.filter(
            (r) =>
              r.category ===
              (props?.evaluationCategory ?? currentEvaluationCategory),
          )
        : null,
    [context.ratings, currentEvaluationCategory, props?.evaluationCategory],
  );
  const authData = useSelector(selectAuthData);
  const myRatingObject = useMemo(() => {
    if (!authData) return undefined;
    return ratings?.find((r) => r.fromBrightId === authData.brightId);
  }, [authData, ratings]);

  const inboundPositiveRatingsCount = useMemo(
    () => ratings?.filter((r) => Number(r.rating) > 0).length,
    [ratings],
  );
  const inboundNegativeRatingsCount = useMemo(
    () => ratings?.filter((r) => Number(r.rating) < 0).length,
    [ratings],
  );
  const inboundRatingsStatsString = useMemo(() => {
    return `${inboundPositiveRatingsCount ?? '...'} Pos / ${
      inboundNegativeRatingsCount ?? '...'
    } Neg`;
  }, [inboundNegativeRatingsCount, inboundPositiveRatingsCount]);

  const [itemsFiltered, itemsOriginal] = useMemo(
    () =>
      [context.itemsFiltered, context.itemsOriginal].map(
        (items) =>
          items?.filter(
            (o) =>
              o.rating === undefined ||
              o.rating.category ===
                (props?.evaluationCategory ?? currentEvaluationCategory),
          ) || null,
      ),
    [
      context.itemsFiltered,
      context.itemsOriginal,
      currentEvaluationCategory,
      props?.evaluationCategory,
    ],
  );

  return {
    ...context,
    itemsFiltered,
    itemsOriginal,
    ratings,
    inboundPositiveRatingsCount,
    inboundNegativeRatingsCount,
    inboundRatingsStatsString,
    myRatingObject,
  };
};
