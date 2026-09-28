import stringify from 'fast-json-stable-stringify';
import nacl from 'tweetnacl';
import { hash, strToUint8Array, uInt8ArrayToB64 } from './crypto';
import { getJson, postJson } from './http';
import type {
  EvaluateOperation,
  EvaluationCategory,
  EvaluationValue,
  OperationState,
} from './types/evaluations';

const OP_VERSION = 6;

// nginx on aura-node answers OPTIONS /operations with 405 and no
// Allow-Headers, so the browser POST never leaves the page. Same-origin
// flat route; other nodes stay direct.
const AURA_NODE = 'https://aura-node.brightid.org';

function operationsUrl(nodeUrl: string, opHash?: string): string {
  const base = nodeUrl.replace(/\/$/, '');
  if (base === AURA_NODE) {
    return opHash
      ? `/api/operations?hash=${encodeURIComponent(opHash)}`
      : '/api/operations';
  }
  return opHash ? `${base}/operations/${opHash}` : `${base}/operations`;
}

export interface SignedEvaluateOp {
  name: 'Evaluate';
  evaluator: string;
  evaluated: string;
  evaluation: EvaluationValue;
  confidence: number;
  domain: 'BrightID';
  category: EvaluationCategory;
  timestamp: number;
  v: number;
  sig: string;
}

export interface BuildEvaluateOperationParams {
  evaluator: string;
  evaluated: string;
  evaluation: EvaluationValue;
  confidence: number;
  category: EvaluationCategory;
  timestamp: number;
  /** Ed25519 secret key bytes (caller decodes the stored b64 key). */
  secretKey: Uint8Array;
}

export function buildEvaluateOperation(params: BuildEvaluateOperationParams): {
  op: SignedEvaluateOp;
  message: string;
} {
  const unsigned = {
    name: 'Evaluate' as const,
    evaluator: params.evaluator,
    evaluated: params.evaluated,
    evaluation: params.evaluation,
    confidence: params.confidence,
    domain: 'BrightID' as const,
    category: params.category,
    timestamp: params.timestamp,
    v: OP_VERSION,
  };

  const message = stringify(unsigned);
  const sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), params.secretKey),
  );

  return { op: { ...unsigned, sig }, message };
}

export async function submitEvaluateOperation(
  nodeUrl: string,
  params: BuildEvaluateOperationParams,
  signal?: AbortSignal,
): Promise<EvaluateOperation> {
  const { op, message } = buildEvaluateOperation(params);

  const res = await postJson<{ data: { hash: string } }>(
    operationsUrl(nodeUrl),
    op,
    signal,
  );

  const returnedHash = res.data?.hash;
  if (returnedHash !== hash(message)) {
    throw new Error('Invalid operation hash returned from server');
  }

  return {
    hash: returnedHash,
    evaluator: op.evaluator,
    evaluated: op.evaluated,
    category: op.category,
    confidence: op.confidence,
    evaluation: op.evaluation,
    timestamp: op.timestamp,
    postTimestamp: Date.now(),
    state: 'INIT',
  };
}

const NODE_STATE_TO_OPERATION_STATE: Record<string, OperationState> = {
  unknown: 'UNKNOWN',
  init: 'INIT',
  sent: 'SENT',
  applied: 'APPLIED',
  failed: 'FAILED',
  expired: 'EXPIRED',
};

export async function fetchOperationState(
  nodeUrl: string,
  hash: string,
  signal?: AbortSignal,
): Promise<OperationState> {
  const res = await getJson<{ data?: { state?: string } }>(
    operationsUrl(nodeUrl, hash),
    signal,
  );
  const nodeState = res.data?.state ?? '';
  return NODE_STATE_TO_OPERATION_STATE[nodeState] ?? 'UNKNOWN';
}
