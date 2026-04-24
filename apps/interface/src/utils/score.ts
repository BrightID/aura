import { userBrightId } from '@/states/user'
import type { AuraImpact } from '@/types/evaluation'
import { EvaluationCategory } from './aura'
import { getSubjectVerifications } from './subject'

export type Requirement = { reason: string; status: 'passed' | 'incomplete'; level: number }

export function computeRequirements(score: number, auraImpacts: AuraImpact[] = []): Requirement[] {
  const lowFromL1 = auraImpacts.some((i) => (i.level ?? 0) >= 1 && (i.confidence ?? 0) >= 1)
  const mediumFromL1 = auraImpacts.some((i) => (i.level ?? 0) >= 1 && (i.confidence ?? 0) >= 2)
  const highFromL2 = auraImpacts.some((i) => (i.level ?? 0) >= 2 && (i.confidence ?? 0) >= 3)
  const mediumFromL2Count = auraImpacts.filter(
    (i) => (i.level ?? 0) >= 2 && (i.confidence ?? 0) >= 2
  ).length
  const highFromL3 = auraImpacts.some((i) => (i.level ?? 0) >= 3 && (i.confidence ?? 0) >= 3)
  const mediumFromL3Count = auraImpacts.filter(
    (i) => (i.level ?? 0) >= 3 && (i.confidence ?? 0) >= 2
  ).length

  return [
    { reason: 'Score of 10M+', status: score >= 10_000_000 ? 'passed' : 'incomplete', level: 1 },
    {
      reason: 'One low+ confidence evaluation from a level 1+ player',
      status: lowFromL1 ? 'passed' : 'incomplete',
      level: 1
    },
    { reason: 'Score of 50M+', status: score >= 50_000_000 ? 'passed' : 'incomplete', level: 2 },
    {
      reason: 'One medium+ confidence evaluation from a level 1+ player',
      status: mediumFromL1 ? 'passed' : 'incomplete',
      level: 2
    },
    { reason: 'Score of 100M+', status: score >= 100_000_000 ? 'passed' : 'incomplete', level: 3 },
    {
      reason:
        'One high+ confidence evaluation from a level 2+ player, or two medium+ from level 2+ players',
      status: highFromL2 || mediumFromL2Count >= 2 ? 'passed' : 'incomplete',
      level: 3
    },
    { reason: 'Score of 150M+', status: score >= 150_000_000 ? 'passed' : 'incomplete', level: 4 },
    {
      reason:
        'One high+ confidence evaluation from a level 3+ player, or two medium+ from level 3+ players',
      status: highFromL3 || mediumFromL3Count >= 2 ? 'passed' : 'incomplete',
      level: 4
    }
  ]
}

// https://hackmd.io/optceo8uQpOW0NqGJjYTag
// Level 1
// Score: 10M+
// Evaluations: one low+ confidence evaluation from one level 1+ player
// Level 2
// Score: 50M+
// Evaluations: one medium+ confidence evaluation from one level 1+ player
// Level 3
// Score: 100M+
// Evaluations: one high+ confidence evaluation from one level 2+ player OR two medium confidence evaluations from two level 2+ players
// Level 4
// Score: 150M+
// Evaluations: one high+ confidence evaluation from one level 3+ player OR two medium confidence evaluations from two level 3+ players

export const getLevelupProgress = async ({
  evaluationCategory
}: {
  evaluationCategory: EvaluationCategory
}) => {
  const subjectId = userBrightId.get()
  const profileQuery = await getSubjectVerifications(subjectId, evaluationCategory)
  if (!profileQuery) return { isUnlocked: false, percent: 0, requirements: [] }

  if (evaluationCategory !== EvaluationCategory.SUBJECT) {
    throw new Error('Evaluation category is only supported for subject for now')
  }

  const { auraScore, auraImpacts } = profileQuery
  const requirements = computeRequirements(auraScore || 0, auraImpacts ?? [])
  const passed = requirements.filter((r) => r.status === 'passed').length
  return {
    isUnlocked: passed === requirements.length,
    percent: Math.round((passed / requirements.length) * 100),
    requirements
  }
}
