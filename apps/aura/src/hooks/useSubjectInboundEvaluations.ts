import useFilterAndSort from 'hooks/useFilterAndSort';
import { AuraFilterId, useInboundEvaluationsFilters } from 'hooks/useFilters';
import { AuraSortId, useInboundEvaluationsSorts } from 'hooks/useSorts';
import { useInboundEvaluations } from 'hooks/useSubjectEvaluations';
import { useEffect, useMemo } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { useRefreshStore } from '@/store/refresh.store';
import { decryptUserData } from '@/utils/crypto';
import { type AuraInboundConnectionAndRatingData, type AuraRating, type BrightIdBackup } from 'types';
import { viewAsToEvaluatorViewAs } from '../constants';
import { getAuraVerification } from '../hooks/useParseBrightIdVerificationData';
import useViewMode from '../hooks/useViewMode';
import { type EvaluationCategory } from '../types/dashboard';

const FILTERS = [
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
] as const;

export function useSubjectInboundEvaluations(props: {
  subjectId: string | undefined;
  evaluationCategory?: EvaluationCategory;
}) {
  const { subjectId = '', evaluationCategory } = props;

  const { refreshInboundRatings, ...hookData } = useInboundEvaluations({ subjectId });
  const { ratings, connections } = hookData;

  const filters = useInboundEvaluationsFilters(FILTERS as unknown as AuraFilterId[], subjectId);
  const sorts = useInboundEvaluationsSorts([
    AuraSortId.RecentEvaluation,
    AuraSortId.EvaluationConfidence,
    AuraSortId.EvaluatorScore,
  ]);

  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = useMemo(
    () =>
      brightIdBackupEncrypted && authData?.password
        ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
        : null,
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
      if (!ratings.some((r) => r.fromBrightId === c.id)) {
        opinions.push({
          fromSubjectId: c.id,
          name: brightIdBackup.connections.find((conn) => conn.id === c.id)?.name,
          inboundConnection: c,
          verifications: c.verifications,
        });
      }
    });
    return opinions.sort(
      (a, b) =>
        ((b.inboundConnection && b.rating && getAuraVerification(b.inboundConnection.verifications, viewAsToEvaluatorViewAs[b.rating.category])?.level) || 0) -
        ((a.inboundConnection && a.rating && getAuraVerification(a.inboundConnection.verifications, viewAsToEvaluatorViewAs[a.rating.category])?.level) || 0),
    );
  }, [brightIdBackup, ratings, connections]);

  const filterAndSortData = useFilterAndSort(
    inboundOpinions,
    filters,
    sorts,
    useMemo(() => ['fromSubjectId', 'name'] as const, []),
    'evaluation|' + subjectId,
  );

  const refreshCounter = useRefreshStore((s) => s.refreshCounter);
  useEffect(() => {
    if (refreshCounter > 0) refreshInboundRatings();
  }, [refreshCounter, refreshInboundRatings]);

  const { currentEvaluationCategory } = useViewMode();
  const activeCategory = evaluationCategory ?? currentEvaluationCategory;

  const filteredRatings = useMemo(
    () => ratings?.filter((r) => r.category === activeCategory) ?? null,
    [ratings, activeCategory],
  );

  const myRatingObject = useMemo<AuraRating | undefined>(
    () => (authData ? filteredRatings?.find((r) => r.fromBrightId === authData.brightId) : undefined),
    [authData, filteredRatings],
  );

  const inboundPositiveRatingsCount = useMemo(
    () => filteredRatings?.filter((r) => Number(r.rating) > 0).length,
    [filteredRatings],
  );
  const inboundNegativeRatingsCount = useMemo(
    () => filteredRatings?.filter((r) => Number(r.rating) < 0).length,
    [filteredRatings],
  );
  const inboundRatingsStatsString = useMemo(
    () => `${inboundPositiveRatingsCount ?? '...'} Pos / ${inboundNegativeRatingsCount ?? '...'} Neg`,
    [inboundPositiveRatingsCount, inboundNegativeRatingsCount],
  );

  const [itemsFiltered, itemsOriginal] = useMemo(
    () =>
      [filterAndSortData.itemsFiltered, filterAndSortData.itemsOriginal].map(
        (items) =>
          items?.filter((o) => o.rating === undefined || o.rating.category === activeCategory) ?? null,
      ),
    [filterAndSortData.itemsFiltered, filterAndSortData.itemsOriginal, activeCategory],
  );

  return {
    refreshInboundRatings,
    ...hookData,
    ...filterAndSortData,
    filters,
    sorts,
    ratings: filteredRatings,
    itemsFiltered,
    itemsOriginal,
    myRatingObject,
    inboundPositiveRatingsCount,
    inboundNegativeRatingsCount,
    inboundRatingsStatsString,
  };
}
