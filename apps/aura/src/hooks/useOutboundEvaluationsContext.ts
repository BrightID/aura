import useFilterAndSort from "hooks/useFilterAndSort"
import { AuraFilterId, useOutboundEvaluationFilters } from "hooks/useFilters"
import { AuraSortId, useOutboundEvaluationSorts } from "hooks/useSorts"
import { useOutboundEvaluations } from "hooks/useSubjectEvaluations"
import { useMemo } from "react"
import { type AuraOutboundConnectionAndRatingData, type BrightIdBackup } from "types"
import { useProfileStore } from "@/store/profile.store"
import { decryptUserData } from "@/utils/crypto"
import useViewMode from "./useViewMode"
import { type EvaluationCategory } from "../types/dashboard"

export function useOutboundEvaluationsContext(props: {
  subjectId: string
  evaluationCategory?: EvaluationCategory
}) {
  const { subjectId, evaluationCategory } = props

  const hookData = useOutboundEvaluations({ subjectId })
  const { ratings, connections } = hookData

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
  )
  const sorts = useOutboundEvaluationSorts([AuraSortId.RecentEvaluation, AuraSortId.EvaluationConfidence])

  const authData = useProfileStore((s) => s.authData)
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted)
  const brightIdBackup = useMemo(
    () =>
      brightIdBackupEncrypted && authData?.password
        ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
        : null,
    [brightIdBackupEncrypted, authData?.password],
  )

  const outboundOpinions = useMemo<AuraOutboundConnectionAndRatingData[]>(() => {
    if (!connections || ratings === null || !brightIdBackup) return []
    const opinions: AuraOutboundConnectionAndRatingData[] = ratings.map((r) => ({
      toSubjectId: r.toBrightId,
      rating: r,
      name: brightIdBackup.connections.find((c) => c.id === r.fromBrightId)?.name,
      outboundConnection: connections.find((c) => c.id === r.fromBrightId),
      verifications: r.verifications,
    }))
    connections.forEach((c) => {
      if (ratings.findIndex((r) => r.toBrightId === c.id) === -1) {
        opinions.push({
          toSubjectId: c.id,
          name: brightIdBackup.connections.find((conn) => conn.id === c.id)?.name,
          outboundConnection: c,
          verifications: c.verifications,
        })
      }
    })
    return opinions.sort(
      (a, b) =>
        (a.rating?.timestamp ?? a.outboundConnection?.timestamp ?? 0) -
        (b.rating?.timestamp ?? b.outboundConnection?.timestamp ?? 0),
    )
  }, [brightIdBackup, ratings, connections])

  const filterAndSortData = useFilterAndSort(
    outboundOpinions,
    filters,
    sorts,
    useMemo(() => ["toSubjectId", "name"], []),
    "activityList|" + subjectId,
  )

  const { currentEvaluationCategory } = useViewMode()
  const activeCategory = evaluationCategory ?? currentEvaluationCategory

  const filteredRatings = useMemo(
    () => ratings?.filter((r) => r.category === activeCategory) ?? null,
    [ratings, activeCategory],
  )

  const [itemsFiltered, itemsOriginal] = useMemo(
    () =>
      [filterAndSortData.itemsFiltered, filterAndSortData.itemsOriginal].map(
        (items) =>
          items?.filter((o) => o.rating === undefined || o.rating.category === activeCategory) ?? null,
      ),
    [filterAndSortData.itemsFiltered, filterAndSortData.itemsOriginal, activeCategory],
  )

  return { ...hookData, ...filterAndSortData, filters, sorts, ratings: filteredRatings, itemsFiltered, itemsOriginal }
}

export function useOutboundEvaluationsContextSafe(subjectId: string) {
  return useOutboundEvaluations({ subjectId: subjectId || undefined })
}
