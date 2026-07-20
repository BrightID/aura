import type { EvaluationCategory } from "@aura/domain/types/evaluations"
import { EvaluationValue } from "@aura/domain/types/evaluations"
import { useViewMode } from "@/hooks/use-view-mode"
import { createEvaluateMutation } from "@/queries/evaluations"

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
