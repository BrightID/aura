import { createMemo } from 'solid-js';
import { createOutboundConnectionsQuery } from '@/queries/connections';
import { authStore } from '@/store/auth';
import { operationsStore } from '@/store/operations';
import type { AuraRating } from '@aura/domain/types/aura';
import type { EvaluateOperation } from '@aura/domain/types/evaluations';
import {
  EvaluationCategory,
  EvaluationValue,
} from '@aura/domain/types/evaluations';

const PENDING_STATES: ReadonlySet<EvaluateOperation['state']> = new Set([
  'INIT',
  'SENT',
  'UNKNOWN',
]);

export function useMyEvaluations() {
  const subjectId = () => authStore.user?.brightId ?? '';
  const query = createOutboundConnectionsQuery(subjectId);

  const myRatings = createMemo<AuraRating[] | null>(() => {
    const data = query.data;
    const id = subjectId();
    if (!data || !id) return null;

    const serverRatings = data.flatMap((c) =>
      (c.auraEvaluations ?? []).map<AuraRating>((e) => ({
        fromBrightId: id,
        toBrightId: c.id,
        rating: String(
          (e.evaluation === EvaluationValue.POSITIVE ? 1 : -1) * e.confidence,
        ),
        category: e.category,
        id: 0,
        createdAt: new Date(e.modified || c.timestamp).toISOString(),
        updatedAt: new Date(e.modified || c.timestamp).toISOString(),
        timestamp: e.modified || c.timestamp,
        isPending: false,
        verifications: c.verifications,
      })),
    );

    const pending = Object.values(operationsStore.byHash).filter((op) =>
      PENDING_STATES.has(op.state),
    );
    const pendingRatings = pending.map<AuraRating>((op) => ({
      fromBrightId: id,
      toBrightId: op.evaluated,
      rating: String(
        (op.evaluation === EvaluationValue.POSITIVE ? 1 : -1) * op.confidence,
      ),
      category: op.category,
      timestamp: op.timestamp,
      createdAt: new Date(op.timestamp).toISOString(),
      updatedAt: new Date(op.timestamp).toISOString(),
      isPending: true,
    }));

    const pendingKeys = new Set(
      pendingRatings.map((r) => `${r.toBrightId}:${r.category}`),
    );
    return serverRatings
      .filter((r) => !pendingKeys.has(`${r.toBrightId}:${r.category}`))
      .concat(pendingRatings)
      .sort((a, b) => a.timestamp - b.timestamp);
  });

  return {
    query,
    loading: () => query.isLoading,
    connections: () => query.data,
    myRatings,
  };
}

/** Ratings filtered to a single evaluation category. */
export function useMyEvaluationData(category: () => EvaluationCategory) {
  const ctx = useMyEvaluations();
  const myRatings = createMemo(
    () => ctx.myRatings()?.filter((r) => r.category === category()) ?? null,
  );
  return { ...ctx, myRatings };
}

/**
 * My rating of one subject in one category (pending ops included).
 * `rating()` is the signed value, undefined when not rated.
 */
export function useMyRating(
  subjectId: () => string,
  category: () => EvaluationCategory,
) {
  const { myRatings } = useMyEvaluations();
  const found = createMemo(() =>
    myRatings()?.find(
      (r) => r.toBrightId === subjectId() && r.category === category(),
    ),
  );
  return {
    rating: () => (found() ? Number(found()!.rating) : undefined),
    isPending: () => found()?.isPending ?? false,
  };
}
