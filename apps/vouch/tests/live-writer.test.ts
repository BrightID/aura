import { expect, test } from 'bun:test';
import nacl from 'tweetnacl';
import { hash, uInt8ArrayToB64 } from '@aura/domain/crypto';
import type { OperationStatus } from '@aura/domain/operations';
import type { OperationState } from '@aura/domain/types/evaluations';
import { isOperatorId, liveConfig, livePaths } from '@/live/config';
import {
  LiveAnswer,
  POLL_MS,
  SETTLE_MS,
  UNDO_MS,
  answerGate,
  signAnswer,
  type WriterDeps,
} from '@/live/writer';

const X = 'xw-l03CAhcY3OfGrrLXMwruLMuNLbRlPGyt6NGS-DEQ';
const keys = nacl.sign.keyPair();
const session = { brightId: 'me', secretKey: uInt8ArrayToB64(keys.secretKey) };

/** Timers and a node the test drives by hand. */
function harness(
  states: (OperationState | OperationStatus)[] = [],
  post?: WriterDeps['post'],
) {
  let now = 1_000;
  let timers: { at: number; fn: () => void }[] = [];
  const posted: { message: string }[] = [];
  const deps: WriterDeps = {
    nodeUrl: 'https://n',
    session: () => session,
    now: () => now,
    setTimer: (fn, ms) => {
      const t = { at: now + ms, fn };
      timers.push(t);
      return t;
    },
    clearTimer: (t) => {
      timers = timers.filter((x) => x !== t);
    },
    post:
      post ??
      (async (_url, _op, message) => {
        posted.push({ message });
        return hash(message);
      }),
    state: async () => {
      const next = states.shift() ?? 'SENT';
      return typeof next === 'string' ? { state: next } : next;
    },
  };
  /** Move the clock on by `ms`, running every timer that falls due. */
  const advance = async (ms: number) => {
    const end = now + ms;
    for (;;) {
      const next = timers
        .filter((t) => t.at <= end)
        .sort((a, b) => a.at - b.at)[0];
      if (!next) break;
      timers = timers.filter((t) => t !== next);
      now = next.at;
      next.fn();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    }
    now = end;
  };
  return { deps, advance, posted, states };
}

const input = { operator: X, question: 1, yes: false, confidence: 3 };

// @scenario vouch-live-interfold: Writes on, reads off
test('writes on alone registers the answer route only', () => {
  expect(livePaths(liveConfig({ VITE_VOUCH_LIVE_WRITES: 'true' }))).toEqual([
    '/live/:operator',
  ]);
});

// @scenario vouch-live-interfold: Not signed in
test('with no core login the answer screen offers sign-in and nothing is sent', async () => {
  expect(answerGate(null, X, isOperatorId)).toBe('signed-out');
  expect(answerGate(session, X, isOperatorId)).toBe('ready');
  const h = harness();
  const a = new LiveAnswer(input, { ...h.deps, session: () => null });
  await h.advance(UNDO_MS);
  expect([a.state, h.posted.length]).toEqual(['failed', 0]);
});

// @scenario vouch-live-interfold: Encode an answer
// @scenario vouch-live-interfold: Practice identity chosen
// The signer comes only from the core session, so no practice persona can be it.
test('an answer is signed as the core user, with its Interfold category', () => {
  const { op, message } = signAnswer(input, session, 5);
  expect(JSON.parse(message)).toMatchObject({
    domain: 'Interfold',
    category: 'Self-custody',
    evaluation: 'negative',
    confidence: 3,
    evaluator: 'me',
    evaluated: X,
  });
  expect(op.evaluator).toBe('me');
});

// Only the question index; a bad confidence has its own test below.
// @scenario vouch-live-interfold: Unknown index
test('an unknown question throws before signing', () => {
  expect(() => signAnswer({ ...input, question: 3 }, session, 5)).toThrow();
});

test('a bad confidence throws before signing', () => {
  expect(() => signAnswer({ ...input, confidence: 2.5 }, session, 5)).toThrow();
  expect(() => signAnswer({ ...input, confidence: 5 }, session, 5)).toThrow();
});

// @scenario vouch-live-interfold: Undo inside the window
test('undo inside the window sends nothing', async () => {
  const h = harness();
  const a = new LiveAnswer(input, h.deps);
  expect(a.undo()).toBe(true);
  await h.advance(UNDO_MS * 2);
  expect(h.posted.length).toBe(0);
});

// @scenario vouch-live-interfold: Undo after submission
test('once sent, an answer cannot be undone', async () => {
  const h = harness();
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS);
  expect(a.state).toBe('submitted');
  expect(a.undo()).toBe(false);
  expect(a.state).toBe('submitted');
});

// @scenario vouch-live-interfold: Hash mismatch
test('a hash that does not match the signed message fails the answer', async () => {
  const h = harness([], async () => {
    throw new Error('Invalid operation hash returned from server');
  });
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
});

// @scenario vouch-live-interfold: Accepted, not yet applied
test('an answer stays submitted until the node applies it', async () => {
  const h = harness(['UNKNOWN', 'INIT', 'SENT', 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS * 3);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Never settles
test('an answer the node has not settled after 5 minutes stays pending, and can be checked again', async () => {
  const h = harness();
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + SETTLE_MS - POLL_MS);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  // Whether it was applied is unknown, and the shared interfold-endorsements
  // contract keeps such an answer pending, so there is no Retry.
  expect(a.state).toBe('unconfirmed');
  a.retry();
  expect(h.posted.length).toBe(1);
  h.states.push('APPLIED');
  a.checkAgain();
  await h.advance(POLL_MS);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Rejected and retried
test('a failed answer can be retried, and is applied only when the node says so', async () => {
  const h = harness(['FAILED', 'SENT', 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('failed');
  a.retry();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect(a.state).toBe('submitted');
  expect(h.posted.length).toBe(2);
  const [first, second] = h.posted.map(
    (p) => JSON.parse(p.message).timestamp as number,
  );
  expect(second!).toBeGreaterThan(first!);
  await h.advance(POLL_MS);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Practice stays practice
test('practice answers and resets make no node request, whatever the switches say', async () => {
  const { createMockAdapter } = await import('@/adapter/mock');
  const { createSeed } = await import('@/model/seed');
  const realFetch = globalThis.fetch;
  const calls: unknown[] = [];
  globalThis.fetch = (async (...args: unknown[]) => {
    calls.push(args);
    throw new Error('no network in practice');
  }) as unknown as typeof fetch;
  try {
    const { unwrap } = await import('solid-js/store');
    const api = createMockAdapter(createSeed(), { delay: 0 });
    const initial = structuredClone(unwrap(api.state));
    api.setState('persona', 'mira');
    const op = api.evaluate({
      evaluated: 'nora',
      category: 'subject',
      question: 0,
      positive: true,
      confidence: 3,
    });
    await op.done;
    // Reset practice the way the Practice dialog does (src/app.ts).
    api.setState(structuredClone(initial));
    expect(op.status).toBe('applied');
    expect(calls).toEqual([]);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('confidence 1 and 4 are the valid edges', () => {
  for (const confidence of [1, 4])
    expect(
      JSON.parse(signAnswer({ ...input, confidence }, session, 5).message)
        .confidence,
    ).toBe(confidence);
});

test('an undone answer shows as undone and cannot be retried', async () => {
  const h = harness();
  const a = new LiveAnswer(input, h.deps);
  a.undo();
  expect([a.state, a.error]).toEqual(['failed', 'Undone']);
  a.retry();
  await h.advance(UNDO_MS * 2);
  expect(h.posted.length).toBe(0);
});

test('retry does nothing unless the answer failed', async () => {
  const h = harness(['SENT', 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  a.retry();
  expect(a.state).toBe('holding');
  await h.advance(UNDO_MS);
  a.retry();
  expect(h.posted.length).toBe(1);
});

test('a failure says why, and a retry clears the reason', async () => {
  const h = harness(['FAILED', 'SENT']);
  const a = new LiveAnswer(input, { ...h.deps, session: () => null });
  await h.advance(UNDO_MS);
  expect(a.error).toBe('Sign in to Aura first');
  const b = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(b.error).toBe('The node reported failed');
  b.retry();
  expect(b.error).toBeUndefined();
});

test('the answer screen refuses a malformed operator id', () => {
  expect(answerGate(session, 'not-an-id', isOperatorId)).toBe('invalid');
  expect(answerGate(null, 'not-an-id', isOperatorId)).toBe('invalid');
});

// @scenario vouch-live-interfold: Failed then applied
test('a failed the node overwrites with applied a moment later is not final', async () => {
  // The node stores failed on a write conflict, then retries the same op.
  const h = harness([{ state: 'FAILED', arangoErrorNum: 1200 }, 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS * 2);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Account changed after the page opened
test('an answer is signed only as the person the screen showed', async () => {
  let current = session;
  const h = harness();
  const a = new LiveAnswer(input, {
    ...h.deps,
    evaluator: 'me',
    session: () => current,
  });
  current = { ...session, brightId: 'someone-else' };
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
  expect(a.error).toContain('another account');
  expect(h.posted.length).toBe(0);
});

// @scenario vouch-live-interfold: Applied is final
test('an applied answer stays applied whatever is pressed', async () => {
  const h = harness(['APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('applied');
  expect(a.undo()).toBe(false);
  a.retry();
  a.checkAgain();
  await h.advance(POLL_MS * 3);
  expect([a.state, h.posted.length]).toEqual(['applied', 1]);
});

// spec-trace's CI check matches this tag to the spec scenario; rename both together.
// @scenario vouch-live-interfold: Signed out after the page opened
test('signing out after the page opened fails the answer and its retry', async () => {
  const h = harness();
  const a = new LiveAnswer(input, {
    ...h.deps,
    evaluator: 'me',
    session: () => null,
  });
  await h.advance(UNDO_MS);
  expect([a.state, a.error]).toEqual(['failed', 'Sign in to Aura first']);
  a.retry();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect([a.state, a.error, h.posted.length]).toEqual([
    'failed',
    'Sign in to Aura first',
    0,
  ]);
});

// The Node URL requirement's scenario "Set": VITE_AURA_NODE_URL is set. spec-trace's
// CI check matches this tag to it; rename both together.
// @scenario vouch-live-interfold: Set
test('a set node URL receives both reads and writes', async () => {
  const nodeUrl = liveConfig({
    VITE_AURA_NODE_URL: 'https://other.node/',
  }).nodeUrl;
  expect(nodeUrl).toBe('https://other.node');
  const urls: string[] = [];
  const h = harness();
  const a = new LiveAnswer(input, {
    ...h.deps,
    nodeUrl,
    post: async (url, _op, message) => {
      urls.push(url);
      return hash(message);
    },
    state: async (url) => {
      urls.push(url);
      return { state: 'APPLIED' };
    },
  });
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('applied');
  expect(new Set(urls)).toEqual(new Set([nodeUrl]));
  const { readEvidence } = await import('@/live/evidence');
  await readEvidence(nodeUrl, X, async (url) => {
    urls.push(url);
    return {};
  });
  expect(new Set(urls)).toEqual(new Set([nodeUrl]));
});

// @scenario vouch-live-interfold: Failed for another reason
test('a failure other than a write conflict is final at once', async () => {
  for (const report of [
    { state: 'FAILED' as const, arangoErrorNum: 1210 },
    'FAILED' as const,
  ]) {
    const h = harness([report, 'APPLIED']);
    const a = new LiveAnswer(input, h.deps);
    await h.advance(UNDO_MS + POLL_MS);
    expect([a.state, a.error]).toEqual(['failed', 'The node reported failed']);
  }
});

// @scenario vouch-live-interfold: Applied before
test('an operation the node reports as applied before counts as applied', async () => {
  // When the node processes the same operation a second time, it overwrites
  // the stored applied state with failed (errorNum 25), though the answer's
  // evaluation is already in the node's database.
  const h = harness([{ state: 'FAILED', errorNum: 25 }]);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('applied');
});

// spec-trace's CI check fails unless the text after "vouch-live-interfold:" below
// is, word for word, a scenario title in openspec/changes/vouch-live-interfold;
// rename that tag text and the scenario title together.
// @scenario vouch-live-interfold: Expired
test('an expired operation fails the answer, with retry', async () => {
  const h = harness(['EXPIRED', 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect([a.state, a.error]).toEqual(['failed', 'The node reported expired']);
  a.retry();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect([a.state, h.posted.length]).toEqual(['submitted', 2]);
});

// spec-trace's CI check fails unless the text after "vouch-live-interfold:" below
// is, word for word, a scenario title in openspec/changes/vouch-live-interfold;
// rename that tag text and the scenario title together.
// @scenario vouch-live-interfold: Conflict that never clears
test('a write conflict that never clears ends unconfirmed at 5 minutes', async () => {
  const conflict = { state: 'FAILED' as const, arangoErrorNum: 1200 };
  const h = harness(Array(SETTLE_MS / POLL_MS + 5).fill(conflict));
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + SETTLE_MS - POLL_MS);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  expect(a.state).toBe('unconfirmed');
});

// spec-trace's CI check fails unless the text after "vouch-live-interfold:" below
// is, word for word, a scenario title in openspec/changes/vouch-live-interfold;
// rename that tag text and the scenario title together.
// The scenario: the evaluator account the answer screen shows was signed out,
// and then signs back in before Retry.
// @scenario vouch-live-interfold: Signed back in
test('a retry after the shown account signs back in is sent as that account', async () => {
  let current: typeof session | null = null;
  const h = harness();
  const a = new LiveAnswer(input, {
    ...h.deps,
    evaluator: 'me',
    session: () => current,
  });
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
  current = session;
  a.retry();
  for (let i = 0; i < 5; i++) await Promise.resolve();
  expect(a.state).toBe('submitted');
  expect(JSON.parse(h.posted[0]!.message).evaluator).toBe('me');
});
