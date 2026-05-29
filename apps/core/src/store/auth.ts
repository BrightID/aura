import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"

export interface AuthState {
  user: {
    brightId: string
    password: string
  } | null

  publicKey: string
  secretKey: string

  key: string | null
  backupEncrypted: string | null
}

const [authStore, setAuthStore] = makePersisted(
  createStore<AuthState>({
    user: null,
    key: null,
    backupEncrypted: null,
    publicKey: "",
    secretKey: "",
  }),
)

export function setKeypair(secretKey: string, publicKey: string): void {
  setAuthStore((prev) => ({ ...prev, secretKey, publicKey }))
}

export { authStore, setAuthStore }
