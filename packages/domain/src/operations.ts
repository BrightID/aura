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
  const path = opHash
    ? `/brightid/v6/operations/${opHash}`
    : '/brightid/v6/operations';
  return `${base}${path}`;
}

/** The three Interfold questions, each sent as its own Evaluate category. */
export type InterfoldCategory = 'Keyholder' | 'Self-custody' | 'Disclosure';

/** A BrightID evaluation (the default), or an Interfold answer. */
export type EvaluateDomainCategory =
  | { domain?: 'BrightID'; category: EvaluationCategory }
  | { domain: 'Interfold'; category: InterfoldCategory };

export type SignedEvaluateOp = Required<EvaluateDomainCategory> & {
  name: 'Evaluate';
  evaluator: string;
  evaluated: string;
  evaluation: EvaluationValue;
  confidence: number;
  timestamp: number;
  v: number;
  sig: string;
};

export type BuildEvaluateOperationParams = EvaluateDomainCategory & {
  evaluator: string;
  evaluated: string;
  evaluation: EvaluationValue;
  confidence: number;
  timestamp: number;
  /** Ed25519 secret key bytes (caller decodes the stored b64 key). */
  secretKey: Uint8Array;
};

export function buildEvaluateOperation(params: BuildEvaluateOperationParams): {
  op: SignedEvaluateOp;
  message: string;
} {
  const fields = {
    name: 'Evaluate' as const,
    evaluator: params.evaluator,
    evaluated: params.evaluated,
    evaluation: params.evaluation,
    confidence: params.confidence,
    timestamp: params.timestamp,
    v: OP_VERSION,
  };
  const unsigned =
    params.domain === 'Interfold'
      ? { ...fields, domain: 'Interfold' as const, category: params.category }
      : { ...fields, domain: 'BrightID' as const, category: params.category };

  const message = stringify(unsigned);
  const sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), params.secretKey),
  );

  return { op: { ...unsigned, sig }, message };
}

/**
 * Post a signed operation and return its hash. Throws when the node's hash
 * differs from the hash of `message`, the exact text that was signed.
 */
export async function postOperation(
  nodeUrl: string,
  op: SignedEvaluateOp,
  message: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await postJson<{ data: { hash: string } }>(
    operationsUrl(nodeUrl),
    op,
    signal,
  );
  const returnedHash = res.data?.hash;
  if (returnedHash !== hash(message)) {
    throw new Error('Invalid operation hash returned from server');
  }
  return returnedHash;
}

export async function submitEvaluateOperation(
  nodeUrl: string,
  params: BuildEvaluateOperationParams & { domain?: 'BrightID' },
  signal?: AbortSignal,
): Promise<EvaluateOperation> {
  if ((params.domain ?? 'BrightID') !== 'BrightID') {
    throw new Error(
      'submitEvaluateOperation accepts BrightID evaluations only',
    );
  }
  const { op, message } = buildEvaluateOperation(params);
  const opHash = await postOperation(nodeUrl, op, message, signal);

  return {
    hash: opHash,
    evaluator: op.evaluator,
    evaluated: op.evaluated,
    category: params.category,
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

/** An operation's state on the node, and the errors it failed with, if any. */
export interface OperationStatus {
  state: OperationState;
  /** The node's error number for a failure; 25 means the operation was applied before. */
  errorNum?: number;
  /** ArangoDB's error number when the node failed it on a database error; 1200 is a write conflict. */
  arangoErrorNum?: number;
}

export async function fetchOperation(
  nodeUrl: string,
  hash: string,
  signal?: AbortSignal,
): Promise<OperationStatus> {
  const res = await getJson<{
    data?: {
      state?: string;
      result?: { errorNum?: unknown; arangoErrorNum?: unknown };
    };
  }>(operationsUrl(nodeUrl, hash), signal);
  const state =
    NODE_STATE_TO_OPERATION_STATE[res.data?.state ?? ''] ?? 'UNKNOWN';
  const result = res.data?.result;
  const status: OperationStatus = { state };
  if (typeof result?.errorNum === 'number') status.errorNum = result.errorNum;
  if (typeof result?.arangoErrorNum === 'number')
    status.arangoErrorNum = result.arangoErrorNum;
  return status;
}

export async function fetchOperationState(
  nodeUrl: string,
  hash: string,
  signal?: AbortSignal,
): Promise<OperationState> {
  return (await fetchOperation(nodeUrl, hash, signal)).state;
}
