import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveVerification } from './verification-save';

test('saves before syncing', async () => {
  const calls: string[] = [];
  assert.equal(
    await saveVerification({
      saveLevel: async () => {
        calls.push('save');
      },
      syncLevel: async () => {
        calls.push('sync');
        return { updated: true };
      },
    }),
    'synced',
  );
  assert.deepEqual(calls, ['save', 'sync']);
});

test('does not sync if saving fails', async () => {
  await assert.rejects(
    saveVerification({
      saveLevel: async () => {
        throw new Error('save failed');
      },
      syncLevel: async () => {
        assert.fail('must not sync');
      },
    }),
    /save failed/,
  );
});

test('reports partial success and retries only the sync', async () => {
  let saves = 0;
  assert.equal(
    await saveVerification({
      saveLevel: async () => {
        saves++;
      },
      syncLevel: async () => {
        throw new Error('offline');
      },
    }),
    'sync-failed',
  );
  assert.equal(
    await saveVerification({ syncLevel: async () => ({ updated: true }) }),
    'synced',
  );
  assert.equal(saves, 1);
});

test('distinguishes an unlinked app from an unsuccessful linked-app update', async () => {
  assert.equal(
    await saveVerification({
      syncLevel: async () => ({ updated: false, reason: 'no_linked_app' }),
    }),
    'unlinked',
  );
  assert.equal(
    await saveVerification({ syncLevel: async () => ({ updated: false }) }),
    'sync-failed',
  );
});
