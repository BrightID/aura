import useFilterAndSort from 'hooks/useFilterAndSort';
import {
  AuraFilterId,
  AuraFilterOptions,
  useOutboundEvaluationFilters,
} from 'hooks/useFilters';
import {
  AuraSortId,
  AuraSortOptions,
  useOutboundEvaluationSorts,
} from 'hooks/useSorts';
import { useOutboundEvaluations } from 'hooks/useSubjectEvaluations';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { selectBrightIdBackup } from 'store/profile/selectors';
import { AuraOutboundConnectionAndRatingData } from 'types';

import useViewMode from '../hooks/useViewMode';
import { EvaluationCategory } from '../types/dashboard';
import { useRefreshEvaluationsContext } from './RefreshEvaluationsContext';

type SubjectOutboundEvaluationsContextType = ReturnType<
  typeof useOutboundEvaluations
> & {
  subjectId: string;
} & ReturnType<typeof useFilterAndSort<AuraOutboundConnectionAndRatingData>> & {
    sorts: AuraSortOptions<AuraOutboundConnectionAndRatingData>;
    filters: AuraFilterOptions<AuraOutboundConnectionAndRatingData>;
  };

// Define the context
export const SubjectOutboundEvaluationsContext =
  createContext<SubjectOutboundEvaluationsContextType | null>(null);

interface ProviderProps {
  subjectId: string;
  children: ReactNode;
}

// Define the Provider component
export const SubjectOutboundEvaluationsContextProvider: React.FC<
  ProviderProps
> = ({ subjectId, children }) => {
  const { refreshOutboundRatings, ...useOutboundEvaluationsHookData } =
    useOutboundEvaluations({
      subjectId,
    });
  const { ratings, connections } = useOutboundEvaluationsHookData;
  const filters = useOutboundEvaluationFilters(
    [
      AuraFilterId.EvaluationPositiveEvaluations,
      AuraFilterId.EvaluationNegativeEvaluations,
      AuraFilterId.EvaluationConfidenceLow,
      AuraFilterId.EvaluationConfidenceMedium,
      AuraFilterId.EvaluationConfidenceHigh,
      AuraFilterId.EvaluationConfidenceVeryHigh,
    ],
    subjectId,
  );

  const sorts = useOutboundEvaluationSorts([
    AuraSortId.RecentEvaluation,
    // AuraSortId.EvaluationScore,
    // AuraSortId.EvaluatorScore,
    AuraSortId.EvaluationConfidence,
  ]);

  const brightIdBackup = useSelector(selectBrightIdBackup);

  const outboundOpinions: AuraOutboundConnectionAndRatingData[] =
    useMemo(() => {
      const outboundConnections = connections;
      if (!outboundConnections || ratings === null || !brightIdBackup)
        return [];
      const outboundOpinions: AuraOutboundConnectionAndRatingData[] =
        ratings.map((r) => ({
          toSubjectId: r.toBrightId,
          rating: r,
          name: brightIdBackup.connections.find(
            (conn) => conn.id === r.fromBrightId,
          )?.name,
          outboundConnection: outboundConnections.find(
            (c) => c.id === r.fromBrightId,
          ),
          verifications: r.verifications,
        }));
      outboundConnections.forEach((c) => {
        const notRated = ratings.findIndex((r) => r.toBrightId === c.id) === -1;
        if (notRated) {
          outboundOpinions.push({
            toSubjectId: c.id,
            name: brightIdBackup.connections.find((conn) => conn.id === c.id)
              ?.name,
            outboundConnection: c,
            verifications: c.verifications,
          });
        }
      });
      return outboundOpinions.sort(
        (a, b) =>
          (a.rating?.timestamp ?? a.outboundConnection?.timestamp ?? 0) -
          (b.rating?.timestamp ?? b.outboundConnection?.timestamp ?? 0),
      );
    }, [brightIdBackup, ratings, connections]);
  const filterAndSortHookData = useFilterAndSort(
    outboundOpinions,
    filters,
    sorts,
    useMemo(() => ['toSubjectId', 'name'], []),
    'activityList|' + subjectId,
  );

  const { refreshCounter } = useRefreshEvaluationsContext();
  useEffect(() => {
    if (refreshCounter > 0) {
      refreshOutboundRatings();
    }
  }, [refreshCounter, refreshOutboundRatings]);

  return (
    <SubjectOutboundEvaluationsContext.Provider
      value={{
        refreshOutboundRatings,
        ...useOutboundEvaluationsHookData,
        ...filterAndSortHookData,
        sorts,
        filters,
        subjectId,
      }}
    >
      {children}
    </SubjectOutboundEvaluationsContext.Provider>
  );
};

export const useOutboundEvaluationsContext = (props: {
  subjectId: string;
  evaluationCategory?: EvaluationCategory;
}): SubjectOutboundEvaluationsContextType => {
  const context = useContext(SubjectOutboundEvaluationsContext);
  if (context === null) {
    throw new Error(
      'SubjectOutboundEvaluationsContext must be used within a SubjectOutboundEvaluationsContextProvider',
    );
  }
  if (context.subjectId !== props.subjectId) {
    throw new Error(
      'SubjectOutboundEvaluationsContextProvider for ' +
        props.subjectId +
        'not provided',
    );
  }
  const { currentEvaluationCategory } = useViewMode();
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
    ratings: useMemo(
      () =>
        context.ratings
          ? context.ratings.filter(
              (r) =>
                r.category ===
                (props?.evaluationCategory ?? currentEvaluationCategory),
            )
          : null,
      [context.ratings, currentEvaluationCategory, props?.evaluationCategory],
    ),
  };
};
