import { afterAll, expect, mock, test } from 'bun:test';

// This file must be the first in its bun process to import src/store/auth: the
// test predicts the id auth.ts takes from solid-js's createUniqueId counter
// when it loads, and bun loads a module once per process. Nothing enforces
// that order. A test file that imports src/store/auth and runs earlier in the
// same process would make this test fail on the key assertions.

// Bun resolves solid-js to its server build, whose createUniqueId does not hand
// out the `cl-<n>` counter ids this test depends on; the app runs the browser
// build. afterAll puts the server build and the real localStorage back, so
// test files that run after this one in the same process see neither the
// browser build nor the fake localStorage below.
const browserSolid = await import('solid-js/dist/solid.js');
mock.module('solid-js', () => browserSolid);
const realStorage = globalThis.localStorage;
afterAll(async () => {
  const serverSolid = await import('solid-js/dist/server.js');
  mock.module('solid-js', () => serverSolid);
  globalThis.localStorage = realStorage;
});

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

const { createUniqueId } = await import('solid-js');
const { CORE_AUTH_STORAGE_KEY } = await import('@aura/domain/core-session');
const session = (brightId: string) =>
  JSON.stringify({
    user: { brightId, password: '' },
    authMethod: 'brightid',
    publicKey: 'p',
    secretKey: `k${brightId}`,
  });

test('the session stays under its generated key, the copy follows every write, and a logout sticks', async () => {
  // The id auth.ts will take is the next one the counter hands out.
  const probe = Number(createUniqueId().slice(3));
  const oldKey = `storage-cl-${probe + 1}`;
  store.set(oldKey, session('A'));

  const { authStore, logout } = await import('../src/store/auth');

  // Loaded from the key every build uses, and copied for apps/vouch.
  expect(authStore.user?.brightId).toBe('A');
  expect(store.get(CORE_AUTH_STORAGE_KEY)).toBe(session('A'));
  // auth.ts took exactly one id, so the store that loads next gets the same id
  // as before this change.
  expect(createUniqueId()).toBe(`cl-${probe + 2}`);

  // A tab still running an older build signs in as B; then this tab logs out.
  store.set(oldKey, session('B'));
  logout();

  expect(JSON.parse(store.get(oldKey)!).user).toBeNull();
  expect(JSON.parse(store.get(CORE_AUTH_STORAGE_KEY)!).user).toBeNull();
});
