import useFilterAndSort from 'hooks/useFilterAndSort';
import { AuraFilterId, type AuraFilterOptions, useInboundEvaluationsFilters } from 'hooks/useFilters';
import { AuraSortId, type AuraSortOptions, useInboundEvaluationsSorts } from 'hooks/useSorts';
import { useInboundEvaluations } from 'hooks/useSubjectEvaluations';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { create } from 'zustand';
import { useProfileStore } from '@/store/profile.store';
import { decryptUserData } from '@/utils/crypto';
import { type AuraInboundConnectionAndRatingData, type AuraRating, type BrightIdBackup } from 'types';
import { viewAsToEvaluatorViewAs } from '../constants';
import { getAuraVerification } from '../hooks/useParseBrightIdVerificationData';
import useViewMode from '../hooks/useViewMode';
import { type EvaluationCategory } from '../types/dashboard';
import { useRefreshStore } from '@/store/refresh.store';

type SubjectInboundEvaluationsData = ReturnType<typeof useInboundEvaluations> & {
  subjectId: string;
} & ReturnType<typeof useFilterAndSort<AuraInboundConnectionAndRatingData>> & {
  sorts: AuraSortOptions<AuraInboundConnectionAndRatingData>;
  filters: AuraFilterOptions<AuraInboundConnectionAndRatingData>;
};

type StoreState = { data: Map<string, SubjectInboundEvaluationsData>; set: (id: string, d: SubjectInboundEvaluationsData) => void };

const useStore = create<StoreState>()((set) => ({
  data: new Map(),
  set: (id, d) => set((s) => { const data = new Map(s.data); data.set(id, d); return { data }; }),
}));

export function SubjectInboundEvaluationsContextProvider({ subjectId, children }: { subjectId: string; children: ReactNode }) {
  const { refreshInboundRatings, ...hookData } = useInboundEvaluations({ subjectId });
  const { ratings, connections } = hookData;

  const filters = useInboundEvaluationsFilters(
    [AuraFilterId.EvaluationPositiveEvaluations, AuraFilterId.EvaluationNegativeEvaluations, AuraFilterId.EvaluationConfidenceLow, AuraFilterId.EvaluationConfidenceMedium, AuraFilterId.EvaluationConfidenceHigh, AuraFilterId.EvaluationConfidenceVeryHigh, AuraFilterId.EvaluationEvaluatorLevelNegative, AuraFilterId.EvaluationEvaluatorLevelZero, AuraFilterId.EvaluationEvaluatorLevelOne, AuraFilterId.EvaluationEvaluatorLevelTwo, AuraFilterId.EvaluationEvaluatorLevelThree, AuraFilterId.EvaluationEvaluatorLevelFour],
    subjectId,
  );
  const sorts = useInboundEvaluationsSorts([AuraSortId.RecentEvaluation, AuraSortId.EvaluationConfidence, AuraSortId.EvaluatorScore]);

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
        opinions.push({ fromSubjectId: c.id, name: brightIdBackup.connections.find((conn) => conn.id === c.id)?.name, inboundConnection: c, verifications: c.verifications });
      }
    });
    return opinions.sort(
      (a, b) =>
        ((b.inboundConnection && b.rating && getAuraVerification(b.inboundConnection.verifications, viewAsToEvaluatorViewAs[b.rating.category])?.level) || 0) -
        ((a.inboundConnection && a.rating && getAuraVerification(a.inboundConnection.verifications, viewAsToEvaluatorViewAs[a.rating.category])?.level) || 0),
    );
  }, [brightIdBackup, ratings, connections]);

  const filterAndSortHookData = useFilterAndSort(inboundOpinions, filters, sorts, useMemo(() => ['fromSubjectId', 'name'], []), 'evaluation|' + subjectId);

  const refreshCounter = useRefreshStore((s) => s.refreshCounter);
  useEffect(() => { if (refreshCounter > 0) refreshInboundRatings(); }, [refreshCounter, refreshInboundRatings]);

  const storeSet = useStore((s) => s.set);
  const data = useMemo(() => ({ refreshInboundRatings, ...hookData, ...filterAndSortHookData, sorts, filters, subjectId }), [refreshInboundRatings, hookData, filterAndSortHookData, sorts, filters, subjectId]);
  const didInit = useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    useStore.setState((s) => {
      const m = new Map(s.data);
      m.set(subjectId, data);
      return { data: m };
    });
  }
  useEffect(() => {
    storeSet(subjectId, data);
  }, [storeSet, subjectId, data]);

  return <>{children}</>;
}

export function useSubjectInboundEvaluationsContextSafe(subjectId: string) {
  return useStore((s) => s.data.get(subjectId) ?? null);
}

export function useSubjectInboundEvaluationsContext(props: { subjectId: string; evaluationCategory?: EvaluationCategory }) {
  const data = useStore((s) => s.data.get(props.subjectId));
  if (!data) throw new Error(`SubjectInboundEvaluationsContextProvider for ${props.subjectId} not mounted`);

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
          items?.filter((o) => o.rating === undefined || o.rating.category === (props.evaluationCategory ?? currentEvaluationCategory)) ?? null,
      ),
    [data.itemsFiltered, data.itemsOriginal, currentEvaluationCategory, props.evaluationCategory],
  );

  return { ...data, itemsFiltered, itemsOriginal, ratings, inboundPositiveRatingsCount, inboundNegativeRatingsCount, inboundRatingsStatsString, myRatingObject };
}
