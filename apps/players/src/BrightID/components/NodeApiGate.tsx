import { ApiResponse } from 'apisauce';
import { NodeApi } from '@/BrightID/api/brightId';
import { pollOperations } from '@/BrightID/utils/operations';
import React, { useEffect, useState } from 'react';
import { RootState } from 'store';
import { useDispatch, useSelector } from 'store/hooks';

import { AURA_NODE_URL_PROXY } from '@/constants/urls';

import { selectKeypair } from '../actions';

type ApiContext = NodeApi | null;

export const NodeApiContext = React.createContext<ApiContext>(null);

export enum ApiGateState {
  INITIAL = 'INITIAL',
  SEARCH_REQUESTED = 'SEARCH_REQUESTED', // should start looking for node
  SEARCHING_NODE = 'SEARCHING', // currently looking for working node
  NODE_AVAILABLE = 'NODE_AVAILABLE', // All good, valid node is set
  ERROR_NO_NODE = 'ERROR_NO_NODE', // Failed to find a working node
}

// some thunks require access to the current NodeAPI, so also
// make it available as a global var.
let globalNodeApi: ApiContext = null;
export const getGlobalNodeApi = () => globalNodeApi;

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector((state: RootState) => state.user.id);
  const { secretKey } = useSelector(selectKeypair);
  const url = AURA_NODE_URL_PROXY;
  const [nodeError, setNodeError] = useState(false);
  const [api, setApi] = useState<NodeApi | null>(null);
  const [gateState, setGateState] = useState<ApiGateState>(
    ApiGateState.INITIAL,
  );

  const dispatch = useDispatch();

  // show node error modal
  useEffect(() => {
    if (nodeError) {
      alert('Could not connect to BrightID Aura node');
    }
  }, [dispatch, nodeError]);

  // Manage NodeAPI instance
  useEffect(() => {
    const apiMonitor = (response: ApiResponse<NodeApiRes, ErrRes>) => {
      if (!response.ok) {
        switch (response.problem) {
          case 'SERVER_ERROR':
          case 'CONNECTION_ERROR':
          case 'NETWORK_ERROR':
          case 'TIMEOUT_ERROR':
            // console.log(
            //   `Node monitor: Detected problem: ${response.status} - ${response.problem}.`,
            // );
            setNodeError(true);
            break;
          default:
          // console.log(`Node monitor: Ignoring problem ${response.problem}`);
        }
      }
    };

    if (url) {
      let apiInstance: NodeApi;
      if (id && secretKey) {
        // console.log(`Creating API with credentials using ${url}`);
        apiInstance = new NodeApi({ url, id, secretKey, monitor: apiMonitor });
      } else {
        // console.log(`Creating anonymous API using ${url}`);
        apiInstance = new NodeApi({
          url,
          id: undefined,
          secretKey: undefined,
          monitor: apiMonitor,
        });
      }
      setGateState(ApiGateState.NODE_AVAILABLE);
      globalNodeApi = apiInstance;
      setApi(apiInstance);
    } else {
      globalNodeApi = null;
      setApi(null);
    }
  }, [url, id, secretKey]);

  // Manage polling for operations
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (api) {
      timerId = setInterval(() => {
        dispatch(pollOperations(api, secretKey));
      }, 5000);
    }

    return () => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
    };
  }, [api, dispatch, secretKey]);

  if (url && api && gateState === ApiGateState.NODE_AVAILABLE) {
    return (
      <NodeApiContext.Provider value={api}>
        {props.children}
      </NodeApiContext.Provider>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default NodeApiGate;
