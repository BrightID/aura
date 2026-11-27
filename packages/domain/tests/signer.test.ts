import { beforeEach, expect, test } from 'bun:test';
import nacl from 'tweetnacl';
import { b64ToUint8Array, strToUint8Array } from '../src/crypto';
import { CORE_AUTH_STORAGE_KEY, readCoreSession } from '../src/core-session';
import {
  buildEvaluateOperation,
  submitEvaluateOperation,
} from '../src/operations';
import { EvaluationCategory, EvaluationValue } from '../src/types/evaluations';

const { publicKey, secretKey } = nacl.sign.keyPair();
const base = {
  evaluator: 'a',
  evaluated: 'b',
  evaluation: EvaluationValue.NEGATIVE,
  confidence: 3,
  timestamp: 1,
  secretKey,
};

test('a BrightID evaluation still defaults to domain BrightID', () => {
  const { op } = buildEvaluateOperation({
    ...base,
    category: EvaluationCategory.PLAYER,
  });
  expect(op.domain).toBe('BrightID');
});

test('an Interfold answer is signed with its domain and category', () => {
  const { op, message } = buildEvaluateOperation({
    ...base,
    domain: 'Interfold',
    category: 'Self-custody',
  });
  expect([op.domain, op.category]).toEqual(['Interfold', 'Self-custody']);
  expect(JSON.parse(message)).toEqual({
    name: 'Evaluate',
    evaluator: 'a',
    evaluated: 'b',
    evaluation: 'negative',
    confidence: 3,
    domain: 'Interfold',
    category: 'Self-custody',
    timestamp: 1,
    v: 6,
  });
  expect(
    nacl.sign.detached.verify(
      strToUint8Array(message),
      b64ToUint8Array(op.sig),
      publicKey,
    ),
  ).toBe(true);
});

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  } as Storage;
});

test('readCoreSession returns the signed-in user, or null', () => {
  const key = 'storage-cl-1';
  const save = (auth: unknown) => store.set(key, JSON.stringify(auth));
  save({ user: { brightId: 'x', password: '' }, secretKey: 'k' });
  // CORE_AUTH_STORAGE_KEY is unset until a core build that writes it loads.
  expect(readCoreSession()).toBeNull();
  store.set(CORE_AUTH_STORAGE_KEY, key);
  expect(readCoreSession()).toEqual({ brightId: 'x', secretKey: 'k' });
  save({ user: null, secretKey: '' });
  expect(readCoreSession()).toBeNull();
  store.set(key, '{not json');
  expect(readCoreSession()).toBeNull();
  for (const auth of [
    { user: { brightId: 'x' }, secretKey: '' },
    { user: { brightId: '' }, secretKey: 'k' },
    { user: { brightId: 5 }, secretKey: 'k' },
    { user: { brightId: 'x' }, secretKey: 5 },
  ]) {
    save(auth);
    expect(readCoreSession()).toBeNull();
  }
});

test('submitEvaluateOperation refuses an Interfold answer at runtime', async () => {
  const params = { ...base, domain: 'Interfold', category: 'Keyholder' };
  await expect(
    submitEvaluateOperation('http://node.invalid', params as never),
  ).rejects.toThrow('BrightID evaluations only');
});
