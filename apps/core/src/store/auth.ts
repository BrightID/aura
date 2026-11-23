import { makePersisted } from '@solid-primitives/storage';
import { createUniqueId } from 'solid-js';
import { createStore } from 'solid-js/store';
import { CORE_AUTH_STORAGE_KEY } from '@aura/domain/core-session';

export type AuthMethod = 'brightid' | 'passkey';

export interface AuthState {
  user: {
    brightId: string;
    /** Empty for passkey sessions — there is no BrightID backup to decrypt. */
    password: string;
  } | null;

  /** How the current session was established. */
  authMethod: AuthMethod | null;

  publicKey: string;
  secretKey: string;
}

// Given no name, makePersisted would save this store as `storage-<id>`, taking
// the next id from solid's counter, so ids follow the order the stores load.
// This store builds that same name itself, with exactly one id at the same
// point in every build. So every build of core, including one still open in
// another tab, reads and writes the same key. Moving or dropping this
// createUniqueId call changes the key and shifts the ids, and so the keys, of
// every store that loads after it.
// Each write is also copied to CORE_AUTH_STORAGE_KEY, the fixed name apps/vouch
// reads; core never reads the copy. If core read it too, it would need a rule
// for which key wins when they differ, and older builds never write the copy.
// ponytail: a write by a tab still running an older build reaches the copy only
// when a newer build next loads; drop the generated key once no older build runs.
const name = `storage-${createUniqueId()}`;
const storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    localStorage.setItem(CORE_AUTH_STORAGE_KEY, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    localStorage.removeItem(CORE_AUTH_STORAGE_KEY);
  },
};
try {
  const saved = localStorage.getItem(name);
  if (saved === null) localStorage.removeItem(CORE_AUTH_STORAGE_KEY);
  else localStorage.setItem(CORE_AUTH_STORAGE_KEY, saved);
} catch {
  // Storage blocked: makePersisted, below, throws on the blocked storage as it
  // did before this copy existed, so the copy must not throw first.
}

const [authStore, setAuthStore] = makePersisted(
  createStore<AuthState>({
    user: null,
    authMethod: null,
    publicKey: '',
    secretKey: '',
  }),
  { name, storage },
);

export function setKeypair(secretKey: string, publicKey: string): void {
  setAuthStore((prev) => ({ ...prev, secretKey, publicKey }));
}

/** Clear the session (user + keys). */
export function logout(): void {
  setAuthStore({
    user: null,
    authMethod: null,
    publicKey: '',
    secretKey: '',
  });
}

export { authStore, setAuthStore };
