import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"

export type AuthMethod = "brightid" | "passkey"

export interface AuthState {
  user: {
    brightId: string
    /** Empty for passkey sessions — there is no BrightID backup to decrypt. */
    password: string
  } | null

  /** How the current session was established. */
  authMethod: AuthMethod | null

  publicKey: string
  secretKey: string
}

const [authStore, setAuthStore] = makePersisted(
  createStore<AuthState>({
    user: null,
    authMethod: null,
    publicKey: "",
    secretKey: "",
  }),
)

export function setKeypair(secretKey: string, publicKey: string): void {
  setAuthStore((prev) => ({ ...prev, secretKey, publicKey }))
}

/** Clear the session (user + keys). */
export function logout(): void {
  setAuthStore({
    user: null,
    authMethod: null,
    publicKey: "",
    secretKey: "",
  })
}

export { authStore, setAuthStore }
