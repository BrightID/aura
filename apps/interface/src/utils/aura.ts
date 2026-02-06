import type { Verification } from '@/types/brightid'

export enum EvaluationCategory {
  SUBJECT = 'subject',
  PLAYER = 'player',
  TRAINER = 'trainer',
  MANAGER = 'manager'
}

export const getAuraVerification = (
  verifications: Verification[] | undefined,
  evaluationCategory: EvaluationCategory
) => {
  if (!verifications) return null
  const auraVerification = verifications.find((verification) => verification.name === 'Aura')
  return auraVerification?.domains
    ?.find((d) => d.name === 'BrightID')
    ?.categories.find((c) => c.name === evaluationCategory)
}
