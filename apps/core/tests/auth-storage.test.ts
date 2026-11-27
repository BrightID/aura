import { afterAll, expect, test } from 'bun:test';
import { createUniqueId, sharedConfig } from 'solid-js';

// Bun resolves solid-js to its server build, whose createUniqueId throws outside
// a hydration context. The app runs the browser build, which hands out
// increasing ids from a counter. This test gives the server build a context so
// it hands out increasing ids too, `t0`, `t1` and so on. The context and the fake storage are process-wide, so afterAll puts
// both back for the test files that run after this one.
sharedConfig.context = { id: 't', count: 0 } as typeof sharedConfig.context;

const realLocalStorage = globalThis.localStorage;
const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  key: (i: number) => [...store.keys()][i] ?? null,
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
} as Storage;

afterAll(() => {
  sharedConfig.context = undefined;
  globalThis.localStorage = realLocalStorage;
});

const { CORE_AUTH_STORAGE_KEY, readCoreSession } =
  await import('@aura/domain/core-session');
const session = (brightId: string | null) =>
  JSON.stringify({
    user: brightId && { brightId, password: '' },
    authMethod: 'brightid',
    publicKey: 'p',
    secretKey: `k${brightId}`,
  });

test('the session stays under its generated key, and vouch reads every write to it', async () => {
  // The id auth.ts will take is the next one the counter hands out.
  const probe = Number(createUniqueId().slice(1));
  const oldKey = `storage-t${probe + 1}`;
  store.set(oldKey, session('A'));

  const { authStore, logout } = await import('../src/store/auth');

  // The store loaded from the key every build uses, and CORE_AUTH_STORAGE_KEY
  // names that key for vouch.
  expect(authStore.user?.brightId).toBe('A');
  expect(store.get(CORE_AUTH_STORAGE_KEY)).toBe(oldKey);
  expect(readCoreSession()?.brightId).toBe('A');
  // auth.ts took exactly one id, so the store that loads next gets the same id
  // as before this change.
  expect(createUniqueId()).toBe(`t${probe + 2}`);

  // A tab still running an older build logs out, then signs in as B. That
  // build never writes CORE_AUTH_STORAGE_KEY, only the store's key, and vouch
  // sees both the logout and the sign-in.
  store.set(oldKey, session(null));
  expect(readCoreSession()).toBeNull();
  store.set(oldKey, session('B'));
  expect(readCoreSession()?.brightId).toBe('B');

  // This tab logs out.
  logout();
  expect(JSON.parse(store.get(oldKey)!).user).toBeNull();
  expect(readCoreSession()).toBeNull();
});
