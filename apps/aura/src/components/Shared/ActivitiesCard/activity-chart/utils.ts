import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import {
  AuraRating,
  AuraNodeBrightIdConnection,
  BrightIdBackup,
} from '@/types';
import {
  EvaluationCategory,
  evaluationsToEvaluatedCategory,
} from '@/types/dashboard';
import {
  getBarChartColor,
  prepareBrightIdProfileResolver,
} from '@/utils/connection';
import { calculateImpact, calculateImpactPercent } from '@/utils/score';

export const calculateRatingsImpact = (
  ratings: AuraRating[],
  evaluations: AuraNodeBrightIdConnection[] | undefined,
  evaluationCategory: EvaluationCategory,
  profileData: ProfileInfo | undefined,
  brightIdBackup: BrightIdBackup | null,
) => {
  if (!evaluations || !profileData) return [];

  const resolver = prepareBrightIdProfileResolver(brightIdBackup);

  const outboundProfiles = evaluations?.reduce(
    (prev, curr) => {
      prev[curr.id] = curr;

      return prev;
    },
    {} as Record<string, AuraNodeBrightIdConnection>,
  );

  const profileImpact = getAuraVerification(
    profileData.verifications,
    evaluationCategory,
  );

  return ratings.map((rating) => {
    const ratingProfile = outboundProfiles[rating.toBrightId];
    const impact = getAuraVerification(
      ratingProfile.verifications,
      evaluationsToEvaluatedCategory[evaluationCategory],
    );

    const score = calculateImpact(
      profileImpact?.score ?? 0,
      Number(rating.rating),
    );

    return {
      ...rating,
      ...getBarChartColor(
        {
          confidence: Number(rating.rating),
          evaluator: rating.toBrightId,
          impact: Math.abs(score),
        },
        brightIdBackup?.userData.id,
        undefined,
      ),
      subjectScore: impact?.score,
      score: profileImpact?.score,
      impact: score,
      impactPercentage: calculateImpactPercent(impact?.impacts ?? [], score),
      evaluatorName: resolver(rating.toBrightId).name,
      evaluated: rating.toBrightId,
    };
  });
};
