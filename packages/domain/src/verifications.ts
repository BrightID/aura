import type { EvaluationCategory } from "./types/evaluations"
import type { Verifications } from "./types/aura"

export const getUserHasRecovery = (verifications?: Verifications) =>
  verifications
    ? !!verifications.find((v) => v.name === "SocialRecoverySetup")
    : null

/** The Aura → BrightID domain category entry for a given evaluation category. */
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

/** Extract level/score for a subject in a category from their verifications. */
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
