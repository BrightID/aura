import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

type WorkerListener = (event: {
  waitUntil: (p: Promise<unknown>) => void;
}) => void;

test('retires the old worker and deletes only Aura asset caches', async () => {
  const listeners = new Map<string, WorkerListener>();
  const calls: string[] = [];
  runInNewContext(
    readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'),
    {
      self: {
        addEventListener: (name: string, listener: WorkerListener) =>
          listeners.set(name, listener),
        skipWaiting: async () => {
          calls.push('skipWaiting');
        },
        clients: {
          claim: async () => {
            calls.push('claim');
          },
        },
        registration: {
          unregister: async () => {
            calls.push('unregister');
          },
        },
      },
      caches: {
        keys: async () => ['aura-012345abcdef', 'other-app', 'aura-user-data'],
        delete: async (key: string) => {
          calls.push(key);
          return true;
        },
      },
    },
  );
  expect([...listeners.keys()]).toEqual(['install', 'activate']);
  for (const name of ['install', 'activate']) {
    let pending: Promise<unknown> | undefined;
    listeners.get(name)!({
      waitUntil: (promise) => {
        pending = promise;
      },
    });
    await pending;
  }
  expect(calls).toEqual([
    'skipWaiting',
    'aura-012345abcdef',
    'claim',
    'unregister',
  ]);
});
