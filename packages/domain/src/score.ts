import { userLevelPoints } from "./levels"
import type { EvaluationCategory } from "./types/evaluations"
import type { AuraImpactRaw } from "./types/aura"

export const calculateImpact = (score: number, rating: number) =>
  rating > 0 ? score * rating : rating * score * 4

export const calculateImpactPercent = (
  impacts: AuraImpactRaw[],
  score: number,
) => {
  const sumImpacts = impacts.reduce((p, c) => Math.abs(c.impact) + p, 0)
  return sumImpacts ? score / sumImpacts : 0
}

export const calculateRemainingScoreToNextLevel = (
  view: EvaluationCategory,
  score: number,
) => {
  const levels = userLevelPoints[view]
  const nextLevelStart = levels.find((item) => item > score) ?? levels.at(-1)!
  return nextLevelStart - score
}

export const maximumScoreTobeReached = 4_000_000_000

export const progressSections = [
  0.00000875, 0.000125, 0.025, 0.075, 0.2, 0.375, 0.625, 1,
]

/** 0–100 progress of a score across the non-linear level sections. */
export const calculateUserScorePercentage = (
  _view: EvaluationCategory,
  score: number,
) => {
  if (score < 0) return -1
  if (score === 0) return 0
  if (score > maximumScoreTobeReached) return 100

  const sectionsPassed = progressSections.filter(
    (pct) => pct * maximumScoreTobeReached < score,
  )
  const currentSection =
    (progressSections[sectionsPassed.length] ?? 1) * maximumScoreTobeReached

  return (
    (sectionsPassed.length / progressSections.length) * 100 +
    (score / currentSection) * progressSections.length
  )
}

/** Level index for a category given its impact ratings. */
export const calculateSubjectScore = (
  category: EvaluationCategory,
  ratings: AuraImpactRaw[],
) => {
  const levels = userLevelPoints[category]
  const score = ratings.reduce((p, item) => (item.score ?? 0) + p, 0)
  return levels.findIndex((item) => item > score)
}

/**
 * One evaluator's share of a subject's total absolute impact, as a rounded
 * percentage — null when the evaluator has no impact or there is none at all.
 */
export const impactShare = (
  impacts: AuraImpactRaw[] | null | undefined,
  evaluator: string | undefined,
): number | null => {
  if (!impacts?.length || !evaluator) return null
  const total = impacts.reduce((sum, i) => sum + Math.abs(i.impact), 0)
  const mine = impacts.find((i) => i.evaluator === evaluator)?.impact
  if (!mine || !total) return null
  return Math.round((Math.abs(mine) / total) * 100)
}
