import type { Verifications } from "./types/aura"
import type { EvaluationCategory } from "./types/evaluations"

export const getUserHasRecovery = (verifications?: Verifications) =>
  verifications
    ? !!verifications.find((v) => v.name === "SocialRecoverySetup")
    : null

export const getAuraVerification = (
  verifications: Verifications | undefined,
  category: EvaluationCategory,
) => {
  if (!verifications) return null
  return verifications
    .find((v) => v.name === "Aura")
    ?.domains?.find((d) => d.name === "BrightID")
    ?.categories.find((c) => c.name === category)
}

export function parseVerifications(
  verifications: Verifications | undefined,
  category: EvaluationCategory,
) {
  const auraVerification = getAuraVerification(verifications, category)
  return {
    userHasRecovery: getUserHasRecovery(verifications),
    auraVerification,
    auraLevel: auraVerification?.level ?? null,
    auraScore: auraVerification?.score ?? null,
    auraImpacts: auraVerification?.impacts ?? null,
  }
}
