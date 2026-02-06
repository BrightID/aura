import type { Verification } from '@/types/brightid'
import type { AuraImpact } from '@/types/evaluation'
import { getBrightId, queryClient } from './apis'
import type { EvaluationCategory } from './aura'

export const getUserHasRecovery = (verifications: Verification[] | undefined) => {
  if (!verifications) return null
  return !!verifications.find((verification) => verification.name === 'SocialRecoverySetup')
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

export function parseBrightIdVerificationData(
  verifications: Verification[] | undefined,
  evaluationCategory: EvaluationCategory
) {
  const userHasRecovery = getUserHasRecovery(verifications)
  const auraVerification = getAuraVerification(verifications, evaluationCategory)

  const auraLevel = auraVerification?.level ?? null
  const auraScore = auraVerification?.score ?? null

  const auraImpacts: AuraImpact[] | null =
    auraVerification?.impacts.map((impact) => {
      // const profileInfo =
      //   impact.evaluator === authData?.brightId
      //     ? brightIdBackup?.userData
      //     : brightIdBackup?.connections.find((conn) => conn.id === impact.evaluator)

      return {
        evaluatorName: `${impact.evaluator.slice(0, 7)}`,
        ...impact
      }
    }) ?? null

  return {
    userHasRecovery,
    auraVerification,
    auraScore,
    auraLevel,
    auraImpacts
  }
}

export const getSubjectVerifications = async (
  subjectId: string | undefined,
  evaluationCategory: EvaluationCategory
) => {
  if (!subjectId) return
  const profileQuery = await queryClient.ensureQueryData({
    queryKey: ['profile', subjectId],
    queryFn: () => getBrightId(subjectId)
  })

  const verifications = profileQuery?.verifications

  const parsedData = parseBrightIdVerificationData(verifications, evaluationCategory)

  return parsedData
}
