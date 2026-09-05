import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { b64ToUint8Array } from '@aura/domain/crypto';
import { submitEvaluateOperation } from '@aura/domain/operations';
import type {
  EvaluationCategory,
  EvaluationValue,
} from '@aura/domain/types/evaluations';
import { NODE_API_BASE } from '@/shared/lib/api';
import { authStore } from '@/store/auth';
import { upsertOperation } from '@/store/operations';

export interface EvaluateMutationVars {
  evaluated: string;
  evaluation: EvaluationValue;
  confidence: number;
  category: EvaluationCategory;
}

/**
 * Mutation that builds, signs, and submits an Evaluate operation, tracking it
 * optimistically in the operations store and invalidating the reads that show
 * the new rating once it settles.
 */
export function createEvaluateMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (vars: EvaluateMutationVars) => {
      const user = authStore.user;
      if (!user) throw new Error('Not authenticated');

      return submitEvaluateOperation(NODE_API_BASE, {
        evaluator: user.brightId,
        evaluated: vars.evaluated,
        evaluation: vars.evaluation,
        confidence: vars.confidence,
        category: vars.category,
        timestamp: Date.now(),
        secretKey: b64ToUint8Array(authStore.secretKey),
      });
    },
    // Track the pending op as soon as the node accepts it (state "INIT").
    onSuccess: (op) => upsertOperation(op),
    onSettled: (_data, _err, vars) => {
      // The evaluator's outbound connections feed `use-my-evaluations`, and the
      // subject's brightid-profile carries its rating.
      queryClient.invalidateQueries({
        queryKey: ['connections', 'outbound', authStore.user?.brightId],
      });
      queryClient.invalidateQueries({
        queryKey: ['brightid-profile', vars.evaluated],
      });
    },
  }));
}
