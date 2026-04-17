import { AuraImpact, Verifications } from '@/types/aura';
import { useMemo } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { decryptUserData } from '@/utils/crypto';
import { BrightIdBackup } from '@/types';
import { EvaluationCategory } from '../types/dashboard';

export const getUserHasRecovery = (
  verifications: Verifications | undefined,
) => {
  if (!verifications) return null;
  return !!verifications.find(
    (verification) => verification.name === 'SocialRecoverySetup',
  );
};
export const getAuraVerification = (
  verifications: Verifications | undefined,
  evaluationCategory: EvaluationCategory,
) => {
  if (!verifications) return null;
  const auraVerification = verifications.find(
    (verification) => verification.name === 'Aura',
  );
  return auraVerification?.domains
    ?.find((d) => d.name === 'BrightID')
    ?.categories.find((c) => c.name === evaluationCategory);
};

export default function useParseBrightIdVerificationData(
  verifications: Verifications | undefined,
  evaluationCategory: EvaluationCategory,
) {
  const userHasRecovery = useMemo(
    () => getUserHasRecovery(verifications),
    [verifications],
  );
  const auraVerification = useMemo(
    () => getAuraVerification(verifications, evaluationCategory),
    [evaluationCategory, verifications],
  );

  const auraLevel = useMemo(
    () => auraVerification?.level ?? null,
    [auraVerification?.level],
  );
  const auraScore = useMemo(
    () => auraVerification?.score ?? null,
    [auraVerification?.score],
  );

  const authData = useProfileStore((s) => s.authData);
  const brightIdBackupEncrypted = useProfileStore((s) => s.brightIdBackupEncrypted);
  const brightIdBackup = brightIdBackupEncrypted && authData?.password
    ? (decryptUserData(brightIdBackupEncrypted, authData.password) as BrightIdBackup)
    : null;

  const auraImpacts: AuraImpact[] | null = useMemo(
    () =>
      auraVerification?.impacts.map((impact) => {
        const profileInfo =
          impact.evaluator === authData?.brightId
            ? brightIdBackup?.userData
            : brightIdBackup?.connections.find(
                (conn) => conn.id === impact.evaluator,
              );

        return {
          evaluatorName: profileInfo?.name ?? `${impact.evaluator.slice(0, 7)}`,
          ...impact,
        };
      }) ?? null,
    [
      auraVerification?.impacts,
      authData?.brightId,
      brightIdBackup?.connections,
      brightIdBackup?.userData,
    ],
  );

  return {
    userHasRecovery,
    auraVerification,
    auraScore,
    auraLevel,
    auraImpacts,
  };
}
