import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import useFilterAndSort from 'hooks/useFilterAndSort';
import { AuraFilterId, AuraFilterOptions, useSubjectFilters } from 'hooks/useFilters';
import { AuraSortId, AuraSortOptions, useSubjectSorts } from 'hooks/useSorts';
import { useMemo, type ReactNode } from 'react';
import { create } from 'zustand';
import { type AuraNodeBrightIdConnectionWithBackupData } from 'types';
import useBrightIdBackupWithUpdatedConnectionData from 'hooks/useBrightIdBackupWithAuraConnectionData';

type SubjectsListState = ReturnType<
  typeof useFilterAndSort<AuraNodeBrightIdConnectionWithBackupData>
> & {
  sorts: AuraSortOptions<AuraNodeBrightIdConnectionWithBackupData>;
  filters: AuraFilterOptions<AuraNodeBrightIdConnectionWithBackupData>;
};

const useSubjectsListStore = create<{ data: SubjectsListState | null; set: (d: SubjectsListState) => void }>()(
  (set) => ({ data: null, set: (data) => set({ data }) }),
);

export function SubjectsListContextProvider({ children }: { children: ReactNode }) {
  const brightIdBackup = useBrightIdBackupWithUpdatedConnectionData();

  const filters = useSubjectFilters(
    useMemo(
      () => [
        AuraFilterId.ConnectionLevelNegative,
        AuraFilterId.ConnectionLevelZero,
        AuraFilterId.ConnectionLevelOne,
        AuraFilterId.ConnectionLevelTwo,
        AuraFilterId.ConnectionLevelThree,
        AuraFilterId.ConnectionLevelFour,
        AuraFilterId.ConnectionYourEvaluationPositive,
        AuraFilterId.ConnectionYourEvaluationNegative,
        AuraFilterId.ConnectionYourEvaluationNotEvaluatedYet,
        AuraFilterId.ConnectionTypeSuspiciousOrReported,
        AuraFilterId.ConnectionTypeJustMet,
        AuraFilterId.ConnectionTypeAlreadyKnownPlus,
        AuraFilterId.ConnectionTypeRecovery,
      ],
      [],
    ),
  );

  const sorts = useSubjectSorts(
    useMemo(
      () => [
        AuraSortId.ConnectionLastUpdated,
        AuraSortId.EvaluationConfidence,
        AuraSortId.ConnectionScore,
        AuraSortId.ConnectionRecentEvaluation,
      ],
      [],
    ),
  );

  const { loading, myRatings } = useMyEvaluationsContext();

  const connectionsSortedDefault = useMemo(() => {
    if (!brightIdBackup?.connections || loading || myRatings === null) return null;

    const uniqueConnections = [
      ...new Map(brightIdBackup.connections.map((item) => [item.id, item])).values(),
    ];

    const connections = uniqueConnections.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

    return connections
      .reduce(
        (acc, c) => {
          const ratingIndex = myRatings.findIndex((r) => r.toBrightId === c.id);
          if (ratingIndex === -1 && (c.level === 'already known' || c.level === 'recovery')) {
            acc[0].push(c);
          } else {
            acc[1].push(c);
          }
          return acc;
        },
        [[], []] as [AuraNodeBrightIdConnectionWithBackupData[], AuraNodeBrightIdConnectionWithBackupData[]],
      )
      .flat();
  }, [brightIdBackup, loading, myRatings]);

  const filterAndSortHookData = useFilterAndSort(
    connectionsSortedDefault,
    filters,
    sorts,
    useMemo(() => ['id', 'name'], []),
    'subjectsList',
  );

  const store = useSubjectsListStore((s) => s.set);
  const data = useMemo(() => ({ ...filterAndSortHookData, filters, sorts }), [filterAndSortHookData, filters, sorts]);
  store(data);

  return <>{children}</>;
}

export function useSubjectsListContext() {
  const data = useSubjectsListStore((s) => s.data);
  if (!data) throw new Error('SubjectsListContextProvider not mounted');
  return data;
}
