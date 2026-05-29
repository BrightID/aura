import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"
import type { EvaluateOperation } from "@/types/evaluations"

export interface OperationsState {
  byHash: Record<string, EvaluateOperation>
}

const [operationsStore, setOperationsStore] = makePersisted(
  createStore<OperationsState>({
    byHash: {},
  }),
)

export { operationsStore, setOperationsStore }
