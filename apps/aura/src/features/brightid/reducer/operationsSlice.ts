import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, GetState, RootState } from "store"
import { RESET_STORE } from "@/features/brightid/actions/reset.store"
import {
  LOCAL_OPERATION_KEEP_THRESHOLD,
  operation_states,
} from "@/features/brightid/utils/constants"

import { EvaluateOp, SubmittedOp } from "../api/operation_types"

export type Operation = SubmittedOp & {
  state: (typeof operation_states)[keyof typeof operation_states]
}

export type EvaluateSubmittedOperation = Operation & EvaluateOp

export type OperationsState = {
  [hash: string]: Operation
}

const initialState: OperationsState = {}

export const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    addOperation: (state, action: PayloadAction<Operation>) => {
      const op = action.payload
      state[op.hash] = op
    },
    removeOperation: (state, action: PayloadAction<string>) => {
      const hash = action.payload
      delete state[hash]
    },
    resetOperations: () => {
      return {}
    },
    updateOperation: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Operation> }>,
    ) => {
      const { id, changes } = action.payload
      if (state[id]) {
        // @ts-ignore
        state[id] = { ...state[id], ...changes }
      }
    },
    removeManyOperations: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload
      ids.forEach((id) => {
        delete state[id]
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_STORE, () => ({}))
  },
})

// Export actions
export const {
  addOperation,
  updateOperation,
  removeOperation,
  resetOperations,
  removeManyOperations,
} = operationsSlice.actions

export const selectAllOperations = createSelector(
  (state: RootState) => state.operations, // Input selector to get operations state
  (operations: OperationsState): Operation[] => Object.values(operations), // Memoized selector to return all operations
)

export const selectOperationByHash = (
  state: RootState,
  hash: string,
): Operation | undefined => state.operations[hash]

const pendingStates = [
  operation_states.UNKNOWN,
  operation_states.INIT,
  operation_states.SENT,
]

export const selectPendingOperations = createSelector(
  selectAllOperations,
  (operations: Operation[]) =>
    operations.filter((op) => op && pendingStates.includes(op.state)),
)

export const selectEvaluateOperations = createSelector(
  selectAllOperations,
  (operations: Operation[]) =>
    operations.filter(
      (op) => op?.name === "Evaluate",
    ) as EvaluateSubmittedOperation[],
)

const outdatedStates = [
  operation_states.APPLIED,
  operation_states.FAILED,
  operation_states.EXPIRED,
]

export const selectOutdatedOperations = createSelector(
  selectAllOperations,
  (operations: Operation[]) => {
    const now = Date.now()
    return operations
      .filter((op) => {
        const timestamp = op.postTimestamp || op.timestamp
        return (
          outdatedStates.includes(op.state) &&
          now - timestamp > LOCAL_OPERATION_KEEP_THRESHOLD
        )
      })
      .map((op) => op.hash)
  },
)

export const scrubOps = () => (dispatch: AppDispatch, getState: GetState) => {
  const removeOpIds = selectOutdatedOperations(getState())
  console.log(
    `Scrubbing ${removeOpIds.length} outdated operations: ${removeOpIds}`,
  )
  dispatch(removeManyOperations(removeOpIds))
}

// Export reducer
export default operationsSlice.reducer
