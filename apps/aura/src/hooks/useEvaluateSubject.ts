import { useCallback, useContext, useEffect, useState } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { useOperationsStore, Operation } from '@/store/operations.store';

import { NodeApiContext } from '../BrightID/components/NodeApiGate';
import { operation_states } from '../BrightID/utils/constants';
import { EvaluationCategory, EvaluationValue } from '../types/dashboard';
import useViewMode from './useViewMode';

export function useEvaluateSubject(evaluationCategory?: EvaluationCategory) {
  const authData = useProfileStore((s) => s.authData);
  const [loading, setLoading] = useState(false);

  const addOperation = useOperationsStore((s) => s.addOperation);
  const api = useContext(NodeApiContext);
  const [connectionOpHash, setConnectionOpHash] = useState<string>('');
  const connectionOp = useOperationsStore((s) =>
    connectionOpHash ? (s[connectionOpHash as keyof typeof s] as Operation | undefined) : undefined,
  );
  useEffect(() => {
    async function getData() {
      console.log({ connectionOp });
      if (connectionOp?.state === operation_states.APPLIED) {
        setLoading(false);
      }
    }

    getData();
  }, [connectionOp]);

  const { currentEvaluationCategory } = useViewMode();
  const submitEvaluation = useCallback(
    async (subjectId: string, newRating: number) => {
      if (!api || !authData) return;
      setLoading(true);
      try {
        const op = (await api.evaluate(
          authData.brightId,
          subjectId,
          newRating < 0 ? EvaluationValue.NEGATIVE : EvaluationValue.POSITIVE,
          Math.abs(newRating),
          'BrightID',
          evaluationCategory ?? currentEvaluationCategory,
          Date.now(),
        )) as Operation;
        op.state = operation_states.UNKNOWN;
        addOperation(op);
        setConnectionOpHash(op.hash);
      } catch (e) {
        setLoading(false);
        throw e;
      }
    },
    [api, authData, currentEvaluationCategory, addOperation, evaluationCategory],
  );

  return { submitEvaluation, loading };
}
