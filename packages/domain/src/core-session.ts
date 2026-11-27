/**
 * The localStorage key that holds the name of the key apps/core keeps its login
 * store under. Core writes the name each time it loads. apps/vouch, served from
 * the same origin, looks up the name here and reads the store itself, so it
 * sees every write to the store, including writes by a tab still running an
 * older build of core. Until core has loaded once in this browser, the name is
 * missing and readCoreSession returns null.
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
    const key = localStorage.getItem(CORE_AUTH_STORAGE_KEY);
    const raw = key ? localStorage.getItem(key) : null;
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
