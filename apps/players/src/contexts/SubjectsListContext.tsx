import { useMyEvaluationsContext } from 'contexts/MyEvaluationsContext';
import useFilterAndSort from 'hooks/useFilterAndSort';
import {
  AuraFilterId,
  AuraFilterOptions,
  useSubjectFilters,
} from 'hooks/useFilters';
import { AuraSortId, AuraSortOptions, useSubjectSorts } from 'hooks/useSorts';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { AuraNodeBrightIdConnectionWithBackupData } from 'types';
import useBrightIdBackupWithUpdatedConnectionData from 'hooks/useBrightIdBackupWithAuraConnectionData';

// Define the context
const SubjectsListContext = createContext<
  | (ReturnType<
      typeof useFilterAndSort<AuraNodeBrightIdConnectionWithBackupData>
    > & {
      sorts: AuraSortOptions<AuraNodeBrightIdConnectionWithBackupData>;
      filters: AuraFilterOptions<AuraNodeBrightIdConnectionWithBackupData>;
    })
  | null
>(null);

interface ProviderProps {
  children: ReactNode;
}

// Define the Provider component
export const SubjectsListContextProvider: React.FC<ProviderProps> = ({
  children,
}) => {
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
        // AuraSortId.ConnectionMostEvaluations,
        AuraSortId.EvaluationConfidence,
        AuraSortId.ConnectionScore,
        AuraSortId.ConnectionRecentEvaluation,
        // AuraSortId.MostMutualConnections,
      ],
      [],
    ),
  );

  const { loading, myRatings } = useMyEvaluationsContext();

  const connectionsSortedDefault = useMemo(() => {
    if (!brightIdBackup?.connections || loading || myRatings === null)
      return null;

    const uniqueConnections = [
      ...new Map(
        brightIdBackup.connections.map((item) => [item.id, item]),
      ).values(),
    ];

    const connections = uniqueConnections.sort(
      (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0),
    );

    const result = connections.reduce(
      (acc, c) => {
        const ratingIndex = myRatings.findIndex((r) => r.toBrightId === c.id);

        if (
          ratingIndex === -1 &&
          (c.level === 'already known' || c.level === 'recovery')
        )
          acc[0].push(c);
        else acc[1].push(c);
        return acc;
      },
      [[], []] as [
        AuraNodeBrightIdConnectionWithBackupData[],
        AuraNodeBrightIdConnectionWithBackupData[],
      ],
    );

    return result.flat();
  }, [brightIdBackup, loading, myRatings]);

  const filterAndSortHookData = useFilterAndSort(
    connectionsSortedDefault,
    filters,
    sorts,
    useMemo(() => ['id', 'name'], []),
    'subjectsList',
  );

  return (
    <SubjectsListContext.Provider
      value={{ ...filterAndSortHookData, filters, sorts }}
    >
      {children}
    </SubjectsListContext.Provider>
  );
};

export const useSubjectsListContext = () => {
  const context = useContext(SubjectsListContext);
  if (context === null) {
    throw new Error(
      'SubjectsListContext must be used within a SubjectsListContextProvider',
    );
  }
  return context;
};
