import useBrightIdBackupWithUpdatedConnectionData from "hooks/useBrightIdBackupWithAuraConnectionData"
import useFilterAndSort from "hooks/useFilterAndSort"
import { AuraFilterId, useSubjectFilters } from "hooks/useFilters"
import { AuraSortId, useSubjectSorts } from "hooks/useSorts"
import { useMemo } from "react"
import { type AuraNodeBrightIdConnectionWithBackupData } from "types"
import { useMyEvaluationData } from "@/hooks/useMyEvaluationData"

const FILTERS = [
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
] as const

const SORTS = [
  AuraSortId.ConnectionLastUpdated,
  AuraSortId.EvaluationConfidence,
  AuraSortId.ConnectionScore,
  AuraSortId.ConnectionRecentEvaluation,
] as const

const SEARCH_KEYS = ["id", "name"] as const

export function useSubjectsList() {
  const brightIdBackup = useBrightIdBackupWithUpdatedConnectionData()
  const filters = useSubjectFilters(FILTERS as unknown as AuraFilterId[])
  const sorts = useSubjectSorts(SORTS as unknown as AuraSortId[])
  const { loading, myRatings } = useMyEvaluationData()

  const items = useMemo(() => {
    if (!brightIdBackup?.connections || loading || myRatings === null)
      return null

    const unique = [
      ...new Map(brightIdBackup.connections.map((c) => [c.id, c])).values(),
    ].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))

    return unique
      .reduce(
        (acc, c) => {
          const hasRating = myRatings.some((r) => r.toBrightId === c.id)
          if (
            !hasRating &&
            (c.level === "already known" || c.level === "recovery")
          ) {
            acc[0].push(c)
          } else {
            acc[1].push(c)
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

  return useFilterAndSort(
    items,
    filters,
    sorts,
    SEARCH_KEYS as unknown as (keyof AuraNodeBrightIdConnectionWithBackupData)[],
    "subjectsList",
  )
}
