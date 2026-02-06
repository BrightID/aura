import { userBrightId } from '@/states/user'
import { EvaluationCategory } from './aura'
import { getSubjectVerifications } from './subject'

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

  const { auraLevel, auraScore, auraImpacts } = profileQuery

  if (evaluationCategory !== EvaluationCategory.SUBJECT) {
    throw new Error('Evaluation category is only supported for subject for now')
  }

  const requirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[] = []
  let percent = 0
  let isUnlocked = false

  const level = auraLevel || 0

  const score = auraScore || 0

  requirements.push({
    reason: 'One low+ evaluation from a player',
    status: level > 0 ? 'passed' : 'incomplete',
    level: 1
  })

  requirements.push({
    reason: 'Score of 10M+ for levelup',
    status: score > 10_000_000 ? 'passed' : 'incomplete',
    level: 2
  })

  const lowEvaluation = auraImpacts?.find((item) => item.level && item.level >= 1)

  requirements.push({
    reason: 'One low+ confidence evaluation from one level 1+ player',
    status: lowEvaluation ? 'passed' : 'incomplete',
    level: 2
  })
  requirements.push({
    reason: 'Score of 50M+ for levelup',
    status: score >= 50_000_000 ? 'passed' : 'incomplete',
    level: 3
  })

  const mediumEvaluations =
    auraImpacts?.filter((item) => item.level && item.level >= 1 && item.confidence >= 2).length ?? 0

  requirements.push({
    reason: 'One medium+ confidence evaluation from one level 1+ player',
    status: mediumEvaluations > 0 ? 'passed' : 'incomplete',
    level: 3
  })

  requirements.push({
    reason: 'Score of 100M+ for levelup',
    status: score >= 100_000_000 ? 'passed' : 'incomplete',
    level: 4
  })

  const highEvaluations =
    auraImpacts?.filter((item) => item.level && item.level >= 2 && item.confidence >= 3).length ?? 0

  requirements.push({
    reason:
      'One high+ confidence evaluation from one level 2+ player OR two medium confidence evaluations from two level 2+ players',
    status: highEvaluations > 0 || mediumEvaluations > 1 ? 'passed' : 'incomplete',
    level: 4
  })

  isUnlocked = requirements.every((r) => r.status === 'passed')
  percent = Math.round(
    (requirements.filter((r) => r.status === 'passed').length / requirements.length) * 100
  )
  return { isUnlocked, percent, requirements }
}
