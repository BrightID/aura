/**
 * The localStorage key under which apps/core keeps a copy of its login store,
 * updated on every write. apps/vouch, served from the same origin, reads the
 * signed-in evaluator from it.
 */
export const CORE_AUTH_STORAGE_KEY = 'aura-core-auth';

export interface CoreSession {
  brightId: string;
  /** Base64 Ed25519 secret key. */
  secretKey: string;
}

/** The person signed in to core in this browser, or null. */
export function readCoreSession(): CoreSession | null {
  try {
    const raw = localStorage.getItem(CORE_AUTH_STORAGE_KEY);
    const auth = raw ? JSON.parse(raw) : null;
    const brightId = auth?.user?.brightId;
    const secretKey = auth?.secretKey;
    return typeof brightId === 'string' &&
      brightId &&
      typeof secretKey === 'string' &&
      secretKey
      ? { brightId, secretKey }
      : null;
  } catch {
    return null;
  }
}
