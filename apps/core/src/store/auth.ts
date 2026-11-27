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

// Given no name, makePersisted saves a store as `storage-<id>`, taking the next
// id from solid's counter, so each store's id depends on how many stores loaded
// before it. This store builds its name the same way, taking one id from the
// counter, so the name matches what makePersisted gave it in older builds, as
// long as the same stores load before it. Every build of core, including one
// still open in another tab, then reads and writes the same key. Moving or
// dropping this createUniqueId call changes this key and the keys of every
// store that loads after it.
//
// The store builds the name itself so it can write the name under
// CORE_AUTH_STORAGE_KEY, where apps/vouch looks it up to read this store.
const name = `storage-${createUniqueId()}`;
try {
  localStorage.setItem(CORE_AUTH_STORAGE_KEY, name);
} catch {
  // With storage blocked, vouch cannot read the session anyway, and
  // makePersisted, below, throws on the same storage.
}

const [authStore, setAuthStore] = makePersisted(
  createStore<AuthState>({
    user: null,
    authMethod: null,
    publicKey: '',
    secretKey: '',
  }),
  { name },
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
