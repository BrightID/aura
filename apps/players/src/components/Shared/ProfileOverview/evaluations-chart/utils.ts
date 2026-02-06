import { AuraImpact } from '@/api/auranode.service';
import { BrightIdBackup } from '@/types';
import { EvaluationCategory } from '@/types/dashboard';
import {
  getBarChartColor,
  prepareBrightIdProfileResolver,
} from '@/utils/connection';
import { calculateImpactPercent } from '@/utils/score';

export const calculateRatingsImpact = (
  impacts: AuraImpact[] | undefined,
  evaluationCategory: EvaluationCategory,
  brightIdBackup: BrightIdBackup | null,
) => {
  if (!impacts) return [];

  const resolver = prepareBrightIdProfileResolver(brightIdBackup);

  const inboundImpacts = impacts?.reduce(
    (prev, curr) => {
      prev[curr.evaluator] = curr;

      return prev;
    },
    {} as Record<string, AuraImpact>,
  );

  return impacts.map((impact) => {
    const ratingProfile = inboundImpacts[impact.evaluator];
    return {
      ...impact,
      ...getBarChartColor(impact, brightIdBackup?.userData.id, undefined),
      subjectScore: ratingProfile.score,
      impactPercentage: calculateImpactPercent(impacts, impact.impact),
      evaluatorName: resolver(impact.evaluator).name,
      evaluated: impact.evaluator,
    };
  });
};
