import { EvaluationCategory } from "./types/evaluations"

/** Human label for a confidence value (1–4). */
export const CONFIDENCE_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Very High",
}

export const confidenceLabel = (value: number): string =>
  CONFIDENCE_LABELS[Math.abs(value)] ?? String(Math.abs(value))

/** Display label for an evaluation category. */
export const categoryLabel: Record<EvaluationCategory, string> = {
  [EvaluationCategory.SUBJECT]: "Subject",
  [EvaluationCategory.PLAYER]: "Player",
  [EvaluationCategory.TRAINER]: "Trainer",
  [EvaluationCategory.MANAGER]: "Manager",
}

/** Who evaluates a category: subjects ← players ← trainers ← managers. */
export const categoryEvaluatedBy: Record<EvaluationCategory, EvaluationCategory> = {
  [EvaluationCategory.SUBJECT]: EvaluationCategory.PLAYER,
  [EvaluationCategory.PLAYER]: EvaluationCategory.TRAINER,
  [EvaluationCategory.TRAINER]: EvaluationCategory.MANAGER,
  [EvaluationCategory.MANAGER]: EvaluationCategory.MANAGER,
}
