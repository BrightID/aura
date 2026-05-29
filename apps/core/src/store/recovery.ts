import { createStore } from "solid-js/store"
import { authStore } from "@/store/auth"

/**
 * Recovery / login handshake state. Ephemeral (not persisted) — a fresh AES
 * channel is set up each login attempt and discarded once recovered.
 *
 * The keypair (publicKey/secretKey) and the recovered user (brightId/password)
 * are NOT kept here — they live on the auth store.
 */

export type RecoverStep = "NOT_STARTED" | "INITIALIZING" | "INITIALIZED" | "ERROR"

/** A keypair older than this is considered stale and regenerated. */
const KEYPAIR_MAX_AGE = 3 * 24 * 60 * 60 * 1000 // 3 days

export interface RecoveryState {
  recoverStep: RecoverStep
  aesKey: string // channel encryption key, embedded in the QR
  timestamp: number // when the keypair was generated
  channel: { channelId: string; url: { href: string } | null }
  errorMessage: string
}

const initialState = (): RecoveryState => ({
  recoverStep: "NOT_STARTED",
  aesKey: "",
  timestamp: 0,
  channel: { channelId: "", url: null },
  errorMessage: "",
})

const [recoveryStore, setRecoveryStore] = createStore<RecoveryState>(
  initialState(),
)

/** True when the auth keypair is missing or older than KEYPAIR_MAX_AGE. */
export function isRecoveryKeypairStale(): boolean {
  return (
    !recoveryStore.timestamp ||
    !authStore.publicKey ||
    recoveryStore.timestamp + KEYPAIR_MAX_AGE < Date.now()
  )
}

export function initRecovery(aesKey: string, timestamp: number): void {
  setRecoveryStore({
    aesKey,
    timestamp,
    errorMessage: "",
    recoverStep: "NOT_STARTED",
  })
}

export function setRecoverStep(recoverStep: RecoverStep): void {
  setRecoveryStore("recoverStep", recoverStep)
}

export function setRecoveryChannel(channelId: string, href: string): void {
  setRecoveryStore("channel", { channelId, url: { href } })
}

export function setRecoveryError(errorMessage: string): void {
  setRecoveryStore({ errorMessage, recoverStep: "ERROR" })
}

export function resetRecovery(): void {
  setRecoveryStore(initialState())
}

export { recoveryStore, setRecoveryStore }
