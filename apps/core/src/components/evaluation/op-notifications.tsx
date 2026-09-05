import { fetchOperationState } from '@aura/domain/operations';
import type { OperationState } from '@aura/domain/types/evaluations';
import { toast } from '@aura/ui';
import { useQueryClient } from '@tanstack/solid-query';
import { createEffect, createMemo, onCleanup } from 'solid-js';
import { useBackup } from '@/hooks/use-backup';
import { NODE_API_BASE } from '@/shared/lib/api';
import { operationsStore, setOperationState } from '@/store/operations';

/** How often to re-check pending ops against the node (old OPERATION_TRACE_TIME). */
const POLL_INTERVAL_MS = 5_000;

/** States that are still in flight and worth polling. */
const PENDING_STATES: ReadonlySet<OperationState> = new Set<OperationState>([
  'INIT',
  'SENT',
  'UNKNOWN',
]);

/**
 * Always-on poller + toaster for submitted evaluations (T1.6). While any op in
 * the operations store is still pending (`INIT`/`SENT`/`UNKNOWN`), it polls each
 * one's state on an interval, writes changes back to the store, and toasts once
 * per op when it settles to `APPLIED` (success) or `FAILED`/`EXPIRED` (error).
 *
 * Renders nothing — mount it once at app root. Pairs with T1.5's optimistic
 * overlay: the overlay shows the rating immediately at `INIT`; once `APPLIED`
 * the invalidated server reads take over and the overlay becomes a no-op.
 *
 * Replaces the old `EvaluationOpNotifications` rich UI with plain toasts.
 */
export default function OpNotifications() {
  const backup = useBackup();
  const queryClient = useQueryClient();

  // Resolve a subject's display name from the backup, falling back to a short id.
  const subjectName = (id: string): string => {
    const data = backup.data;
    if (!data) return id.slice(0, 7);
    const info =
      id === data.userData.id
        ? data.userData
        : data.connections.find((c) => c.id === id);
    return info?.name ?? id.slice(0, 7);
  };

  // Hashes we've already toasted on, so each transition fires exactly once.
  const notified = new Set<string>();

  const pendingHashes = createMemo(() =>
    Object.values(operationsStore.byHash)
      .filter((op) => PENDING_STATES.has(op.state))
      .map((op) => op.hash),
  );

  const poll = async () => {
    for (const hash of pendingHashes()) {
      const op = operationsStore.byHash[hash];
      if (!op) continue;
      let next: OperationState;
      try {
        next = await fetchOperationState(NODE_API_BASE, hash);
      } catch {
        // Transient node/transport error — leave the op pending and retry next tick.
        continue;
      }
      if (next === op.state) continue;

      setOperationState(hash, next);

      // The op only lands on the node's reads once it APPLIES — the
      // submit-time invalidation in `createEvaluateMutation` refetched while
      // the node still held the old data. Re-invalidate now so the fresh
      // rating/impacts replace the optimistic overlay.
      if (next === 'APPLIED') {
        queryClient.invalidateQueries({
          queryKey: ['brightid-profile', op.evaluated],
        });
        queryClient.invalidateQueries({
          queryKey: ['connections', 'outbound', op.evaluator],
        });
      }

      if (notified.has(hash)) continue;
      if (next === 'APPLIED') {
        notified.add(hash);
        toast.success('Evaluation submitted', {
          description: subjectName(op.evaluated),
        });
      } else if (next === 'FAILED' || next === 'EXPIRED') {
        notified.add(hash);
        toast.error('Evaluation failed', {
          description: subjectName(op.evaluated),
        });
      }
    }
  };

  // Run the interval only while there are pending ops; tear it down otherwise so
  // we never poll an idle node. The effect re-runs when pending count changes.
  createEffect(() => {
    if (pendingHashes().length === 0) return;
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    void poll();
    onCleanup(() => clearInterval(timer));
  });

  return null;
}
