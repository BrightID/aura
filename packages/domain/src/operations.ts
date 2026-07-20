import stringify from "fast-json-stable-stringify"
import nacl from "tweetnacl"
import { hash, strToUint8Array, uInt8ArrayToB64 } from "./crypto"
import { getJson, postJson } from "./http"
import type {
  EvaluateOperation,
  EvaluationCategory,
  EvaluationValue,
  OperationState,
} from "./types/evaluations"

/** BrightID operation protocol version (constant in the old app). */
const OP_VERSION = 6

/**
 * The signed "Evaluate" operation exactly as the node canonicalizes and hashes
 * it. Key set and value types must match the server's expectation byte-for-byte
 * — `fast-json-stable-stringify` sorts keys, so the serialized message is
 * identical regardless of insertion order here.
 */
export interface SignedEvaluateOp {
  name: "Evaluate"
  evaluator: string
  evaluated: string
  evaluation: EvaluationValue
  confidence: number
  domain: "BrightID"
  category: EvaluationCategory
  timestamp: number
  v: number
  sig: string
}

export interface BuildEvaluateOperationParams {
  evaluator: string
  evaluated: string
  evaluation: EvaluationValue
  confidence: number
  category: EvaluationCategory
  timestamp: number
  /** Ed25519 secret key bytes (caller decodes the stored b64 key). */
  secretKey: Uint8Array
}

/**
 * Build and sign an "Evaluate" operation. Pure: no I/O. Returns the signed op
 * plus the canonical `message` it was signed over (also what the node hashes),
 * so the caller can verify the returned hash without re-serializing.
 */
export function buildEvaluateOperation(params: BuildEvaluateOperationParams): {
  op: SignedEvaluateOp
  message: string
} {
  const unsigned = {
    name: "Evaluate" as const,
    evaluator: params.evaluator,
    evaluated: params.evaluated,
    evaluation: params.evaluation,
    confidence: params.confidence,
    domain: "BrightID" as const,
    category: params.category,
    timestamp: params.timestamp,
    v: OP_VERSION,
  }

  const message = stringify(unsigned)
  const sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), params.secretKey),
  )

  return { op: { ...unsigned, sig }, message }
}

/**
 * Build, sign, and submit an "Evaluate" operation to the node, returning an
 * `EvaluateOperation` the operations store can track. The node independently
 * canonicalizes the op and returns its hash; we verify it equals `hash(message)`
 * (SHA256 -> url-safe b64) and throw on mismatch so a rejected op never lands in
 * the store as if accepted.
 */
export async function submitEvaluateOperation(
  nodeUrl: string,
  params: BuildEvaluateOperationParams,
  signal?: AbortSignal,
): Promise<EvaluateOperation> {
  const { op, message } = buildEvaluateOperation(params)

  const res = await postJson<{ data: { hash: string } }>(
    `${nodeUrl}/operations`,
    op,
    signal,
  )

  const returnedHash = res.data?.hash
  if (returnedHash !== hash(message)) {
    throw new Error("Invalid operation hash returned from server")
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
    state: "INIT",
  }
}

/**
 * The node reports operation states in lowercase; the domain `OperationState`
 * is uppercase. Map known values, defaulting unexpected strings to `"UNKNOWN"`.
 */
const NODE_STATE_TO_OPERATION_STATE: Record<string, OperationState> = {
  unknown: "UNKNOWN",
  init: "INIT",
  sent: "SENT",
  applied: "APPLIED",
  failed: "FAILED",
  expired: "EXPIRED",
}

/**
 * Fetch the current state of a submitted operation from the node. GETs
 * `${nodeUrl}/operations/${hash}` (response shape `{ data: { state, result } }`,
 * matching the old `getOperationState`) and normalizes the lowercase node state
 * to the uppercase domain `OperationState`. Pure aside from the GET; unknown or
 * missing states resolve to `"UNKNOWN"`. Throws only on transport errors.
 */
export async function fetchOperationState(
  nodeUrl: string,
  hash: string,
  signal?: AbortSignal,
): Promise<OperationState> {
  const res = await getJson<{ data?: { state?: string } }>(
    `${nodeUrl}/operations/${hash}`,
    signal,
  )
  const nodeState = res.data?.state ?? ""
  return NODE_STATE_TO_OPERATION_STATE[nodeState] ?? "UNKNOWN"
}
