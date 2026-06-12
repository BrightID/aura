import { EvaluationValue } from "@aura/domain/types/evaluations"
import type { EvaluationCategory } from "@aura/domain/types/evaluations"
import { createEvaluateMutation } from "@/queries/evaluations"
import { useViewMode } from "@/hooks/use-view-mode"

/**
 * Submit an evaluation for a subject.
 *
 * `newRating` is a signed magnitude: a negative value is a NEGATIVE evaluation,
 * positive is POSITIVE, and the confidence is its absolute value. Category
 * defaults to the current view mode's category, with an optional override.
 */
export function useEvaluateSubject(category?: () => EvaluationCategory) {
  const { currentEvaluationCategory } = useViewMode()
  const mutation = createEvaluateMutation()

  const submitEvaluation = (subjectId: string, newRating: number) =>
    mutation.mutateAsync({
      evaluated: subjectId,
      evaluation:
        newRating < 0 ? EvaluationValue.NEGATIVE : EvaluationValue.POSITIVE,
      confidence: Math.abs(newRating),
      category: category?.() ?? currentEvaluationCategory(),
    })

  return {
    submitEvaluation,
    isPending: () => mutation.isPending,
    error: () => mutation.error,
  }
}
