import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"
import type {
  EvaluateOperation,
  OperationState,
} from "@aura/domain/types/evaluations"

export interface OperationsState {
  byHash: Record<string, EvaluateOperation>
}

const [operationsStore, setOperationsStore] = makePersisted(
  createStore<OperationsState>({
    byHash: {},
  }),
)

const TERMINAL_STATES: OperationState[] = ["APPLIED", "FAILED", "EXPIRED"]
const OPERATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// The store is persisted and ops were never removed — prune finished ones on
// startup so it doesn't grow unbounded across sessions.
{
  const cutoff = Date.now() - OPERATION_RETENTION_MS
  const stale = Object.values(operationsStore.byHash).filter(
    (op) =>
      TERMINAL_STATES.includes(op.state) &&
      (op.postTimestamp ?? op.timestamp) < cutoff,
  )
  if (stale.length)
    setOperationsStore("byHash", (prev) => {
      const next = { ...prev }
      for (const op of stale) delete next[op.hash]
      return next
    })
}

/** Insert or replace an operation, keyed by its hash. */
export function upsertOperation(op: EvaluateOperation): void {
  setOperationsStore("byHash", op.hash, op)
}

/** Update the tracked state of an existing operation. */
export function setOperationState(hash: string, state: OperationState): void {
  setOperationsStore("byHash", hash, "state", state)
}

export { operationsStore, setOperationsStore }
