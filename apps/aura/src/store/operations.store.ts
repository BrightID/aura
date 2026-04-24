import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { LOCAL_OPERATION_KEEP_THRESHOLD, operation_states } from '@/features/brightid/utils/constants';
import type { EvaluateOp, SubmittedOp } from '@/features/brightid/api/operation_types';

export type Operation = SubmittedOp & {
  state: (typeof operation_states)[keyof typeof operation_states];
};

export type EvaluateSubmittedOperation = Operation & EvaluateOp;

export type OperationsState = Record<string, Operation>;

interface OperationsActions {
  addOperation: (op: Operation) => void;
  removeOperation: (hash: string) => void;
  resetOperations: () => void;
  updateOperation: (id: string, changes: Partial<Operation>) => void;
  removeManyOperations: (ids: string[]) => void;
  scrubOps: () => void;
  reset: () => void;
}

const pendingStates = [operation_states.UNKNOWN, operation_states.INIT, operation_states.SENT];
const outdatedStates = [operation_states.APPLIED, operation_states.FAILED, operation_states.EXPIRED];

export const useOperationsStore = create<OperationsState & OperationsActions>()(
  persist(
    (set, get) => ({
      addOperation: (op) => set((s) => ({ ...s, [op.hash]: op })),
      removeOperation: (hash) =>
        set((s) => {
          const next = { ...s };
          delete next[hash];
          return next;
        }),
      resetOperations: () =>
        set((s) => {
          const next = { ...s };
          // remove only operation keys (not action methods)
          for (const key of Object.keys(next)) {
            if (typeof next[key as keyof typeof next] !== 'function') {
              delete next[key as keyof typeof next];
            }
          }
          return next;
        }),
      updateOperation: (id, changes) =>
        set((s) => {
          const op = s[id as keyof typeof s] as Operation | undefined;
          if (!op) return s;
          return { ...s, [id]: { ...op, ...changes } };
        }),
      removeManyOperations: (ids) =>
        set((s) => {
          const next = { ...s };
          ids.forEach((id) => delete next[id as keyof typeof next]);
          return next;
        }),
      scrubOps: () => {
        const state = get();
        const now = Date.now();
        const toRemove = Object.values(state)
          .filter((v): v is Operation => typeof v === 'object' && v !== null && 'hash' in v)
          .filter((op) => {
            const timestamp = op.postTimestamp || op.timestamp;
            return outdatedStates.includes(op.state) && now - timestamp > LOCAL_OPERATION_KEEP_THRESHOLD;
          })
          .map((op) => op.hash);
        if (toRemove.length) {
          set((s) => {
            const next = { ...s };
            toRemove.forEach((id) => delete next[id as keyof typeof next]);
            return next;
          });
        }
      },
      reset: () =>
        set((s) => {
          const next: Partial<OperationsState & OperationsActions> = {};
          for (const key of Object.keys(s)) {
            if (typeof s[key as keyof typeof s] === 'function') {
              next[key as keyof typeof next] = s[key as keyof typeof s] as never;
            }
          }
          return next as OperationsState & OperationsActions;
        }),
    }),
    { name: 'operations', storage: createJSONStorage(() => localforage) },
  ),
);

export const selectAllOperations = (): Operation[] => {
  const state = useOperationsStore.getState();
  return Object.values(state).filter(
    (v): v is Operation => typeof v === 'object' && v !== null && 'hash' in v,
  );
};

export const selectPendingOperations = (): Operation[] =>
  selectAllOperations().filter((op) => op && pendingStates.includes(op.state));

export const selectEvaluateOperations = (): EvaluateSubmittedOperation[] =>
  selectAllOperations().filter((op) => op?.name === 'Evaluate') as EvaluateSubmittedOperation[];
