import { afterEach, expect, test } from 'bun:test';
import { evidenceView, interfoldEvidence, readEvidence } from '@/live/evidence';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test('an operator the node has no user for has no answers yet', async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: true,
        errorNum: 10,
        errorMessage: 'The user x is not found.',
        code: 404,
      }),
      { status: 404 },
    )) as unknown as typeof fetch;
  expect(await readEvidence('https://n', 'x'.repeat(43))).toEqual([]);
});

test('a 404 that is not the node saying it has no such user is a failed read', async () => {
  globalThis.fetch = (async () =>
    new Response('<html>404 Not Found</html>', {
      status: 404,
      headers: { 'content-type': 'text/html' },
    })) as unknown as typeof fetch;
  await expect(
    readEvidence('https://n/wrong-prefix', 'x'.repeat(43)),
  ).rejects.toThrow('404');
});

const record = (confidence: number, modified = 1, category = 'Keyholder') => ({
  domain: 'Interfold',
  category,
  evaluation: 'positive',
  confidence,
  modified,
});

test('a connection without a usable evaluator id adds nothing', () => {
  expect(
    interfoldEvidence({
      data: {
        connections: [
          { id: '', auraEvaluations: [record(2)] },
          { id: 7, auraEvaluations: [record(2)] },
          { auraEvaluations: [record(2)] },
        ],
      },
    }),
  ).toEqual([]);
});

test('confidence counts from 1 to 4 and nothing outside', () => {
  const kept = (confidence: number) =>
    interfoldEvidence({
      data: {
        connections: [{ id: 'e', auraEvaluations: [record(confidence)] }],
      },
    }).length;
  expect([0, 1, 4, 5].map(kept)).toEqual([0, 1, 1, 0]);
});

test('answers come newest first, whatever order the node sends them in', () => {
  const answers = interfoldEvidence({
    data: {
      connections: [
        { id: 'a', auraEvaluations: [record(2, 1)] },
        { id: 'b', auraEvaluations: [record(2, 9)] },
        { id: 'c', auraEvaluations: [record(2, 4)] },
      ],
    },
  });
  expect(answers.map((a) => a.evaluator)).toEqual(['b', 'c', 'a']);
});

test('a response with no connections has no answers', () => {
  expect(interfoldEvidence({})).toEqual([]);
  expect(interfoldEvidence({ data: { connections: null } })).toEqual([]);
});

test('a read in progress shows as loading, even after an earlier read failed', () => {
  // Solid keeps a resource's last error while it loads again.
  expect(evidenceView({ loading: true, error: new Error('502') })).toBe(
    'loading',
  );
  expect(evidenceView({ loading: false, error: new Error('502') })).toBe(
    'error',
  );
  expect(evidenceView({ loading: false, error: undefined })).toBe('answers');
});
