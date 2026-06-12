import { createMemo } from "solid-js"
import { createBrightIdProfileQuery } from "@/queries/connections"
import { parseVerifications } from "@aura/domain/verifications"
import type { EvaluationCategory } from "@aura/domain/types/evaluations"

/** Level / score / impacts for a subject in a category, from the aura node. */
export function useSubjectVerifications(
  subjectId: () => string,
  category: () => EvaluationCategory,
) {
  const query = createBrightIdProfileQuery(subjectId)
  const parsed = createMemo(() =>
    parseVerifications(query.data?.verifications, category()),
  )

  return {
    query,
    loading: () => query.isLoading,
    isFetching: () => query.isFetching,
    auraLevel: () => parsed().auraLevel,
    auraScore: () => parsed().auraScore,
    auraImpacts: () => parsed().auraImpacts,
    userHasRecovery: () => parsed().userHasRecovery,
    refresh: () => query.refetch(),
  }
}
