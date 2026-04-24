import { ApiResponse } from 'apisauce';
import { NodeApi } from '@/features/brightid/api/brightId';
import { pollOperations } from '@/features/brightid/utils/operations';
import React, { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/store/user.store';
import { useKeypairStore } from '@/store/keypair.store';

import { AURA_NODE_URL_PROXY } from '@/constants/urls';

type ApiContext = NodeApi | null;

export const NodeApiContext = React.createContext<ApiContext>(null);

export enum ApiGateState {
  INITIAL = 'INITIAL',
  SEARCH_REQUESTED = 'SEARCH_REQUESTED',
  SEARCHING_NODE = 'SEARCHING',
  NODE_AVAILABLE = 'NODE_AVAILABLE',
  ERROR_NO_NODE = 'ERROR_NO_NODE',
}

let globalNodeApi: ApiContext = null;
export const getGlobalNodeApi = () => globalNodeApi;

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useUserStore((s) => s.id);
  // Read the raw Base64 string — stable primitive, won't cause infinite effect loops
  const secretKeyB64 = useKeypairStore((s) => s.secretKey);
  const secretKey = useMemo(() => {
    if (!secretKeyB64) return null;
    try {
      return new Uint8Array(atob(secretKeyB64).split('').map((c) => c.charCodeAt(0)));
    } catch {
      return new Uint8Array(secretKeyB64.split('').map((c) => c.charCodeAt(0)));
    }
  }, [secretKeyB64]);
  const url = AURA_NODE_URL_PROXY;
  const [nodeError, setNodeError] = useState(false);
  const [api, setApi] = useState<NodeApi | null>(null);
  const [gateState, setGateState] = useState<ApiGateState>(
    ApiGateState.INITIAL,
  );

  useEffect(() => {
    if (nodeError) {
      alert('Could not connect to BrightID Aura node');
    }
  }, [nodeError]);

  useEffect(() => {
    const apiMonitor = (response: ApiResponse<NodeApiRes, ErrRes>) => {
      if (!response.ok) {
        switch (response.problem) {
          case 'SERVER_ERROR':
          case 'CONNECTION_ERROR':
          case 'NETWORK_ERROR':
          case 'TIMEOUT_ERROR':
            setNodeError(true);
            break;
          default:
        }
      }
    };

    if (url) {
      let apiInstance: NodeApi;
      if (id && secretKey) {
        apiInstance = new NodeApi({ url, id, secretKey, monitor: apiMonitor });
      } else {
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

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (api) {
      timerId = setInterval(() => {
        pollOperations(api, secretKey);
      }, 5000);
    }

    return () => {
      if (timerId !== null) {
        clearInterval(timerId);
      }
    };
  }, [api, secretKey]);

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
