import useBrightIdBackupWithUpdatedConnectionData from "hooks/useBrightIdBackupWithAuraConnectionData"
import useFilterAndSort from "hooks/useFilterAndSort"
import { AuraFilterId, useSubjectFilters } from "hooks/useFilters"
import { AuraSortId, useSubjectSorts } from "hooks/useSorts"
import { useMemo } from "react"
import { type AuraNodeBrightIdConnectionWithBackupData } from "types"
import { useMyEvaluationsContext } from "@/hooks/useMyEvaluationsContext"

export function useSubjectsList() {
  const brightIdBackup = useBrightIdBackupWithUpdatedConnectionData()
  const { loading, myRatings } = useMyEvaluationsContext()

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
  )

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
  )

  const connectionsSortedDefault = useMemo(() => {
    if (!brightIdBackup?.connections || loading || myRatings === null) {
      return null
    }

    // Remove duplicates and sort by timestamp (newest first)
    const uniqueConnections = [
      ...new Map(
        brightIdBackup.connections.map((item) => [item.id, item]),
      ).values(),
    ]

    const sorted = uniqueConnections.sort(
      (a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0),
    )

    // Prioritize "already known" and "recovery" without ratings
    return sorted
      .reduce(
        (acc, connection) => {
          const hasRating = myRatings.some(
            (r) => r.toBrightId === connection.id,
          )
          if (
            !hasRating &&
            (connection.level === "already known" ||
              connection.level === "recovery")
          ) {
            acc[0].push(connection)
          } else {
            acc[1].push(connection)
          }
          return acc
        },
        [[], []] as [
          AuraNodeBrightIdConnectionWithBackupData[],
          AuraNodeBrightIdConnectionWithBackupData[],
        ],
      )
      .flat()
  }, [brightIdBackup, loading, myRatings])

  const filterAndSortData = useFilterAndSort(
    connectionsSortedDefault,
    filters,
    sorts,
    useMemo(() => ["id", "name"], []),
    "subjectsList",
  )

  const state = useMemo(
    () => ({
      ...filterAndSortData,
      filters,
      sorts,
    }),
    [filterAndSortData, filters, sorts],
  )

  return state
}
