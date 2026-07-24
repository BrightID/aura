import { EvaluationCategory } from "./types/evaluations"

export const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Very High",
}

export const confidenceLabel = (value: number): string =>
  CONFIDENCE_LABELS[Math.abs(value)] ?? String(Math.abs(value))

export const categoryLabel: Record<EvaluationCategory, string> = {
  [EvaluationCategory.SUBJECT]: "Subject",
  [EvaluationCategory.PLAYER]: "Player",
  [EvaluationCategory.TRAINER]: "Trainer",
  [EvaluationCategory.MANAGER]: "Manager",
}

export const categoryEvaluatedBy: Record<
  EvaluationCategory,
  EvaluationCategory
> = {
  [EvaluationCategory.SUBJECT]: EvaluationCategory.PLAYER,
  [EvaluationCategory.PLAYER]: EvaluationCategory.TRAINER,
  [EvaluationCategory.TRAINER]: EvaluationCategory.MANAGER,
  [EvaluationCategory.MANAGER]: EvaluationCategory.MANAGER,
}
