import useFilterAndSort from 'hooks/useFilterAndSort';
import {
  AuraFilterId,
  AuraFilterOptions,
  useInboundConnectionsFilters,
} from 'hooks/useFilters';
import {
  AuraSortId,
  AuraSortOptions,
  useInboundConnectionsSorts,
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

import useViewMode from '../hooks/useViewMode';
import { EvaluationCategory } from '../types/dashboard';
import { useRefreshEvaluationsContext } from './RefreshEvaluationsContext';

type SubjectInboundConnectionsContextType = ReturnType<
  typeof useInboundEvaluations
> & {
  subjectId: string;
} & ReturnType<typeof useFilterAndSort<AuraInboundConnectionAndRatingData>> & {
    sorts: AuraSortOptions<AuraInboundConnectionAndRatingData>;
    filters: AuraFilterOptions<AuraInboundConnectionAndRatingData>;
  };
// Define the context
export const SubjectInboundConnectionsContext =
  createContext<SubjectInboundConnectionsContextType | null>(null);

interface ProviderProps {
  subjectId: string;
  children: ReactNode;
}

export const SubjectInboundConnectionsContextProvider: React.FC<
  ProviderProps
> = ({ subjectId, children }) => {
  const { refreshInboundRatings, ...useSubjectInboundConnectionsHookData } =
    useInboundEvaluations({
      subjectId,
    });
  const { ratings, connections } = useSubjectInboundConnectionsHookData;
  const filters = useInboundConnectionsFilters(
    [
      AuraFilterId.EvaluationMutualConnections,
      AuraFilterId.ConnectionTypeSuspiciousOrReported,
      AuraFilterId.ConnectionTypeJustMet,
      AuraFilterId.ConnectionTypeAlreadyKnownPlus,
      AuraFilterId.ConnectionTypeRecovery,
      AuraFilterId.TheirRecovery,
    ],
    subjectId,
  );

  const sorts = useInboundConnectionsSorts([AuraSortId.ConnectionLastUpdated]);

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
          verifications: c.verifications!,
        });
      }
    });
    return inboundOpinions
      .sort(
        (a, b) =>
          (a.inboundConnection?.timestamp ?? 0) -
          (b.inboundConnection?.timestamp ?? 0),
      )
      .reduce(
        (acc, o) => {
          const myConnection = brightIdBackup.connections.find(
            (conn) => conn.id === o.inboundConnection?.id,
          );
          if (
            myConnection?.level === 'already known' ||
            myConnection?.level === 'recovery'
          ) {
            acc[0].push(o);
          } else if (
            o.inboundConnection?.level === 'already known' ||
            o.inboundConnection?.level === 'recovery'
          ) {
            acc[1].push(o);
          } else {
            acc[2].push(o);
          }
          return acc;
        },
        [[], [], []] as AuraInboundConnectionAndRatingData[][],
      )
      .flat();
  }, [brightIdBackup, ratings, connections]);

  const filterAndSortHookData = useFilterAndSort(
    inboundOpinions,
    filters,
    sorts,
    useMemo(() => ['fromSubjectId', 'name'], []),
    // 'evaluationsList',
    'evaluationList|' + subjectId,
  );

  const { refreshCounter } = useRefreshEvaluationsContext();
  useEffect(() => {
    if (refreshCounter > 0) {
      refreshInboundRatings();
    }
  }, [refreshCounter, refreshInboundRatings]);

  return (
    <SubjectInboundConnectionsContext.Provider
      value={{
        refreshInboundRatings,
        ...useSubjectInboundConnectionsHookData,
        ...filterAndSortHookData,
        sorts,
        filters,
        subjectId,
      }}
    >
      {children}
    </SubjectInboundConnectionsContext.Provider>
  );
};

export const useSubjectInboundConnectionsContext = (props: {
  subjectId: string;
  evaluationCategory?: EvaluationCategory;
}): SubjectInboundConnectionsContextType & {
  myRatingObject: AuraRating | undefined;
} => {
  const context = useContext(SubjectInboundConnectionsContext);
  if (context === null) {
    throw new Error(
      'SubjectInboundConnectionsContext must be used within a SubjectInboundConnectionsContextProvider',
    );
  }
  if (context.subjectId !== props.subjectId) {
    throw new Error(
      'SubjectInboundConnectionsContextProvider for ' +
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
              Boolean(o.inboundConnection) &&
              (o.rating === undefined ||
                o.rating.category ===
                  (props?.evaluationCategory ?? currentEvaluationCategory)),
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
