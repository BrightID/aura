import { NodeApi } from '@/BrightID/api/brightId';
import {
  operation_states,
  OPERATION_TRACE_TIME,
} from '@/BrightID/utils/constants';
import {
  selectPendingOperations,
  useOperationsStore,
  Operation,
} from '@/store/operations.store';
import { useUserStore } from '@/store/user.store';

type OperationStateType = (typeof operation_states)[keyof typeof operation_states];

const handleOpUpdate = (
  _id: string,
  op: Operation,
  state: OperationStateType,
  _result: string,
  _api: NodeApi,
) => {
  let showDefaultError = false;
  switch (op.name) {
    default:
      if (state === operation_states.FAILED) {
        showDefaultError = true;
      }
  }

  if (showDefaultError) {
    alert('Failed operation');
  }
};

export const pollOperations = async (api: NodeApi, secretKey: any) => {
  const operations = selectPendingOperations();
  const { id } = useUserStore.getState();

  try {
    for (const op of operations) {
      let queryApi = api;
      if (op.apiUrl) {
        queryApi = new NodeApi({ url: op.apiUrl, id, secretKey });
      }
      const { state, result } = await queryApi.getOperationState(op.hash);

      if (op.state !== state) {
        switch (state) {
          case operation_states.UNKNOWN:
            console.log(`operation ${op.name} (${op.hash}) unknown on server`);
            break;
          case operation_states.INIT:
          case operation_states.SENT:
            break;
          case operation_states.APPLIED:
          case operation_states.FAILED:
            handleOpUpdate(id, op, state, result, api);
            break;
          default:
            console.log(`Op ${op.name} (${op.hash}) has invalid state '${state}'!`);
        }
        useOperationsStore.getState().updateOperation(op.hash, { state });
      } else {
        if (
          (op.postTimestamp || op.timestamp) + OPERATION_TRACE_TIME <
          Date.now()
        ) {
          useOperationsStore.getState().updateOperation(op.hash, { state: operation_states.EXPIRED });
        }
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn(err.message);
    } else {
      console.warn(err);
    }
  }
};
