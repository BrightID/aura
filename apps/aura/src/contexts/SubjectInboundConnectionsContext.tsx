import useFilterAndSort from 'hooks/useFilterAndSort';
import { AuraFilterId, type AuraFilterOptions, useInboundConnectionsFilters } from 'hooks/useFilters';
import { AuraSortId, type AuraSortOptions, useInboundConnectionsSorts } from 'hooks/useSorts';
import { useInboundEvaluations } from 'hooks/useSubjectEvaluations';
import { useEffect, useMemo, type ReactNode } from 'react';
import { create } from 'zustand';
import { useProfileStore } from '@/store/profile.store';
import { decryptUserData } from '@/utils/crypto';
import { type AuraInboundConnectionAndRatingData, type AuraRating, type BrightIdBackup } from 'types';
import useViewMode from '../hooks/useViewMode';
import { type EvaluationCategory } from '../types/dashboard';
import { useRefreshStore } from '@/store/refresh.store';

type SubjectInboundConnectionsData = ReturnType<typeof useInboundEvaluations> & {
  subjectId: string;
} & ReturnType<typeof useFilterAndSort<AuraInboundConnectionAndRatingData>> & {
  sorts: AuraSortOptions<AuraInboundConnectionAndRatingData>;
  filters: AuraFilterOptions<AuraInboundConnectionAndRatingData>;
};

type StoreState = { data: Map<string, SubjectInboundConnectionsData>; set: (id: string, d: SubjectInboundConnectionsData) => void };

const useStore = create<StoreState>()((set) => ({
  data: new Map(),
  set: (id, d) => set((s) => { const data = new Map(s.data); data.set(id, d); return { data }; }),
}));

export function SubjectInboundConnectionsContextProvider({ subjectId, children }: { subjectId: string; children: ReactNode }) {
  const { refreshInboundRatings, ...hookData } = useInboundEvaluations({ subjectId });
  const { ratings, connections } = hookData;

  const filters = useInboundConnectionsFilters(
    [AuraFilterId.EvaluationMutualConnections, AuraFilterId.ConnectionTypeSuspiciousOrReported, AuraFilterId.ConnectionTypeJustMet, AuraFilterId.ConnectionTypeAlreadyKnownPlus, AuraFilterId.ConnectionTypeRecovery, AuraFilterId.TheirRecovery],
    subjectId,
  );
  const sorts = useInboundConnectionsSorts([AuraSortId.ConnectionLastUpdated]);

  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = useMemo(
    () => brightIdBackupEncrypted && authData?.password ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup) : null,
    [brightIdBackupEncrypted, authData?.password],
  );

  const inboundOpinions = useMemo<AuraInboundConnectionAndRatingData[]>(() => {
    if (!connections || ratings === null || !brightIdBackup) return [];
    const opinions: AuraInboundConnectionAndRatingData[] = ratings.map((r) => ({
      fromSubjectId: r.fromBrightId,
      rating: r,
      name: brightIdBackup.connections.find((c) => c.id === r.fromBrightId)?.name,
      inboundConnection: connections.find((c) => c.id === r.fromBrightId),
      verifications: r.verifications!,
    }));
    connections.forEach((c) => {
      if (ratings.findIndex((r) => r.fromBrightId === c.id) === -1) {
        opinions.push({ fromSubjectId: c.id, name: brightIdBackup.connections.find((conn) => conn.id === c.id)?.name, inboundConnection: c, verifications: c.verifications! });
      }
    });
    return opinions
      .sort((a, b) => (a.inboundConnection?.timestamp ?? 0) - (b.inboundConnection?.timestamp ?? 0))
      .reduce(
        (acc, o) => {
          const myConn = brightIdBackup.connections.find((c) => c.id === o.inboundConnection?.id);
          if (myConn?.level === 'already known' || myConn?.level === 'recovery') acc[0].push(o);
          else if (o.inboundConnection?.level === 'already known' || o.inboundConnection?.level === 'recovery') acc[1].push(o);
          else acc[2].push(o);
          return acc;
        },
        [[], [], []] as AuraInboundConnectionAndRatingData[][],
      )
      .flat();
  }, [brightIdBackup, ratings, connections]);

  const filterAndSortHookData = useFilterAndSort(inboundOpinions, filters, sorts, useMemo(() => ['fromSubjectId', 'name'], []), 'evaluationList|' + subjectId);

  const refreshCounter = useRefreshStore((s) => s.refreshCounter);
  useEffect(() => { if (refreshCounter > 0) refreshInboundRatings(); }, [refreshCounter, refreshInboundRatings]);

  const storeSet = useStore((s) => s.set);
  const data = useMemo(() => ({ refreshInboundRatings, ...hookData, ...filterAndSortHookData, sorts, filters, subjectId }), [refreshInboundRatings, hookData, filterAndSortHookData, sorts, filters, subjectId]);
  storeSet(subjectId, data);

  return <>{children}</>;
}

export function useSubjectInboundConnectionsContext(props: { subjectId: string; evaluationCategory?: EvaluationCategory }) {
  const data = useStore((s) => s.data.get(props.subjectId));
  if (!data) throw new Error(`SubjectInboundConnectionsContextProvider for ${props.subjectId} not mounted`);

  const { currentEvaluationCategory } = useViewMode();
  const authData = useProfileStore((s) => s.authData);

  const ratings = useMemo(
    () => data.ratings?.filter((r) => r.category === (props.evaluationCategory ?? currentEvaluationCategory)) ?? null,
    [data.ratings, currentEvaluationCategory, props.evaluationCategory],
  );

  const myRatingObject = useMemo<AuraRating | undefined>(
    () => (authData ? ratings?.find((r) => r.fromBrightId === authData.brightId) : undefined),
    [authData, ratings],
  );

  const inboundPositiveRatingsCount = useMemo(() => ratings?.filter((r) => Number(r.rating) > 0).length, [ratings]);
  const inboundNegativeRatingsCount = useMemo(() => ratings?.filter((r) => Number(r.rating) < 0).length, [ratings]);
  const inboundRatingsStatsString = useMemo(
    () => `${inboundPositiveRatingsCount ?? '...'} Pos / ${inboundNegativeRatingsCount ?? '...'} Neg`,
    [inboundPositiveRatingsCount, inboundNegativeRatingsCount],
  );

  const [itemsFiltered, itemsOriginal] = useMemo(
    () =>
      [data.itemsFiltered, data.itemsOriginal].map(
        (items) =>
          items?.filter(
            (o) => Boolean(o.inboundConnection) && (o.rating === undefined || o.rating.category === (props.evaluationCategory ?? currentEvaluationCategory)),
          ) ?? null,
      ),
    [data.itemsFiltered, data.itemsOriginal, currentEvaluationCategory, props.evaluationCategory],
  );

  return { ...data, itemsFiltered, itemsOriginal, ratings, inboundPositiveRatingsCount, inboundNegativeRatingsCount, inboundRatingsStatsString, myRatingObject };
}
