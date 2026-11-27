import { expect, test } from 'bun:test';
import nacl from 'tweetnacl';
import { hash, uInt8ArrayToB64 } from '@aura/domain/crypto';
import { HttpError } from '@aura/domain/http';
import {
  fetchOperation,
  postOperation,
  type OperationStatus,
} from '@aura/domain/operations';
import type { OperationState } from '@aura/domain/types/evaluations';
import { isOperatorId, liveConfig, livePaths } from '@/live/config';
import {
  LiveAnswer,
  POLL_MS,
  SETTLE_MS,
  UNDO_MS,
  answerAction,
  answerGate,
  signAnswer,
  type WriterDeps,
} from '@/live/writer';

const X = 'xw-l03CAhcY3OfGrrLXMwruLMuNLbRlPGyt6NGS-DEQ';
const keys = nacl.sign.keyPair();
const session = { brightId: 'me', secretKey: uInt8ArrayToB64(keys.secretKey) };

/** Timers and a node the test drives by hand. */
function harness(
  /**
   * What each poll gets, in order, then 'SENT' once the list runs out. An
   * Error is thrown, as for a 404 or no response.
   */
  states: (OperationState | OperationStatus | Error)[] = [],
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
      if (next instanceof Error) throw next;
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
const notFound = () => new HttpError('GET failed with status 404', 404);
const noResponse = () => new TypeError('Failed to fetch');
/** Let pending promise callbacks run; a retry's poll and post take fewer than 5 turns. */
const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

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
  let refuse = true;
  const h = harness(
    [notFound(), 'SENT', 'APPLIED'],
    async (_u, _op, message) => {
      h.posted.push({ message });
      if (refuse) {
        refuse = false;
        throw new HttpError('POST failed with status 400', 400);
      }
      return hash(message);
    },
  );
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
  await h.advance(1);
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
    MODE: 'production',
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
  const h = harness(['EXPIRED', 'EXPIRED']);
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

// @scenario vouch-live-interfold: Post rejected
test('a post the node refuses with a 4xx fails the answer', async () => {
  const h = harness([], async () => {
    throw new HttpError('POST failed with status 400', 400);
  });
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
});

// @scenario vouch-live-interfold: No response to the post
// A 5xx counts with no response: the node may have stored the operation first.
test("a post with no response polls the answer's own hash", async () => {
  for (const err of [
    noResponse(),
    new HttpError('POST failed with status 502', 502),
  ]) {
    const polled: string[] = [];
    const h = harness([], async (_u, _op, message) => {
      h.posted.push({ message });
      throw err;
    });
    const a = new LiveAnswer(input, {
      ...h.deps,
      state: async (_url, opHash) => {
        polled.push(opHash);
        return { state: 'APPLIED' };
      },
    });
    await h.advance(UNDO_MS);
    expect(a.state).toBe('submitted');
    await h.advance(POLL_MS);
    expect(a.state).toBe('applied');
    expect(polled).toEqual([hash(h.posted[0]!.message)]);
  }
});

// @scenario vouch-live-interfold: Poll request fails
test('a poll that gets no response keeps the answer submitted', async () => {
  const h = harness([noResponse(), 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Never stored
test('an answer the node never stored fails after 5 minutes of 404s, and can be retried', async () => {
  const h = harness(Array.from({ length: SETTLE_MS / POLL_MS + 1 }, notFound));
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + SETTLE_MS - POLL_MS);
  expect(a.state).toBe('submitted');
  await h.advance(POLL_MS);
  expect([a.state, a.error]).toEqual([
    'failed',
    'The node has no record of this answer',
  ]);
  // One poll that reported a state means the node holds it: unconfirmed instead.
  const h2 = harness(['SENT', ...Array.from({ length: 70 }, notFound)]);
  const b = new LiveAnswer(input, h2.deps);
  await h2.advance(UNDO_MS + SETTLE_MS);
  expect(b.state).toBe('unconfirmed');
  // The 5-minute window used all but one of the 404s; the retry's poll of the
  // old hash gets that last one, and the answer is signed again.
  a.retry();
  await flush();
  expect([a.state, h.posted.length]).toEqual(['submitted', 2]);
});

// @scenario vouch-live-interfold: Still pending at retry
test('a retry whose earlier operation is still pending polls it and signs nothing', async () => {
  const h = harness([
    { state: 'FAILED', errorNum: 4 },
    { state: 'FAILED', arangoErrorNum: 1200 },
    'APPLIED',
  ]);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('failed');
  a.retry();
  await flush();
  expect([a.state, h.posted.length]).toEqual(['submitted', 1]);
  await h.advance(POLL_MS);
  expect(a.state).toBe('applied');
});

// @scenario vouch-live-interfold: Node unreachable at retry
test('a retry that cannot reach the node fails again and signs nothing', async () => {
  const h = harness([{ state: 'FAILED', errorNum: 4 }, noResponse()]);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  a.retry();
  await flush();
  expect([a.state, h.posted.length]).toEqual(['failed', 1]);
  expect(a.error).toContain('Could not reach the node');
});

// @scenario vouch-live-interfold: Applied after it failed
test('a retry finds the earlier operation applied and signs nothing', async () => {
  const h = harness([{ state: 'FAILED', errorNum: 4 }, 'APPLIED']);
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('failed');
  a.retry();
  await flush();
  expect([a.state, h.posted.length]).toEqual(['applied', 1]);
});

test('a disposed answer sends nothing more and stops polling', async () => {
  const h = harness();
  const a = new LiveAnswer(input, h.deps);
  a.dispose();
  await h.advance(UNDO_MS * 2);
  expect([a.state, h.posted.length]).toEqual(['holding', 0]);
  let polls = 0;
  const b = new LiveAnswer(input, {
    ...h.deps,
    state: async () => {
      polls++;
      return { state: 'SENT' };
    },
  });
  await h.advance(UNDO_MS + POLL_MS);
  b.dispose();
  await h.advance(POLL_MS * 3);
  expect([b.state, polls]).toEqual(['submitted', 1]);
});

// @scenario vouch-live-interfold: Answers to aura-node
// The test checks the URLs only; landing's /api/operations route forwards them
// to aura-node.
test("posts and polls for aura-node go to landing's same-origin route", async () => {
  const realFetch = globalThis.fetch;
  const urls: string[] = [];
  const { op, message } = signAnswer(input, session, 5);
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    urls.push(url);
    const body =
      init?.method === 'POST'
        ? { data: { hash: hash(message) } }
        : { data: { state: 'applied' } };
    return new Response(JSON.stringify(body));
  }) as unknown as typeof fetch;
  try {
    const nodeUrl = liveConfig({ MODE: 'production' }).nodeUrl;
    await postOperation(nodeUrl, op, message);
    await fetchOperation(nodeUrl, 'h1');
    expect(urls).toEqual(['/api/operations', '/api/operations?hash=h1']);
  } finally {
    globalThis.fetch = realFetch;
  }
});

/** A Yes whose post the node refused with a 400, so it failed after a post. */
async function refusedYes(states: Parameters<typeof harness>[0]) {
  let refuse = true;
  const h = harness(states, async (_u, _op, message) => {
    h.posted.push({ message });
    if (refuse) {
      refuse = false;
      throw new HttpError('POST failed with status 400', 400);
    }
    return hash(message);
  });
  const a = new LiveAnswer({ ...input, yes: true, confidence: 2 }, h.deps);
  await h.advance(UNDO_MS);
  expect(a.state).toBe('failed');
  return { h, a };
}
const signed = (h: ReturnType<typeof harness>, i: number) =>
  JSON.parse(h.posted[i]!.message) as {
    evaluation: string;
    confidence: number;
  };

// @scenario vouch-live-interfold: Retry with another confidence
test('a retry signs the confidence selected when Retry is pressed', async () => {
  const { h, a } = await refusedYes([notFound()]);
  a.retry({ confidence: 4 });
  await flush();
  expect(h.posted.length).toBe(2);
  expect(signed(h, 0).confidence).toBe(2);
  expect(signed(h, 1)).toMatchObject({ evaluation: 'positive', confidence: 4 });
  expect(a.answer.confidence).toBe(4);
});

// @scenario vouch-live-interfold: Earlier answer still pending
test('a new answer to a failed posted answer whose post is still pending is not sent', async () => {
  const h = harness([{ state: 'FAILED', errorNum: 4 }, 'INIT']);
  const a = new LiveAnswer({ ...input, yes: true }, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  expect(a.state).toBe('failed');
  expect(answerAction(a)).toBe('retry');
  a.retry({ yes: false, confidence: 3 });
  await flush();
  expect([a.state, a.answer.yes, h.posted.length]).toEqual([
    'submitted',
    true,
    1,
  ]);
});

// @scenario vouch-live-interfold: Earlier answer gone
test('a new answer to a failed posted answer whose post is gone is signed at once', async () => {
  const { h, a } = await refusedYes([notFound()]);
  expect(answerAction(a)).toBe('retry');
  a.retry({ yes: false, confidence: 3 });
  await flush();
  // No undo window: it is posted without the clock moving.
  expect([a.state, h.posted.length]).toEqual(['submitted', 2]);
  expect(signed(h, 1)).toMatchObject({ evaluation: 'negative', confidence: 3 });
  expect(a.answer.yes).toBe(false);
});

// @scenario vouch-live-interfold: Earlier answer applied after it failed
test('a new answer to a failed posted answer the node then applied is not sent', async () => {
  const h = harness([{ state: 'FAILED', errorNum: 4 }, 'APPLIED']);
  const a = new LiveAnswer({ ...input, yes: true }, h.deps);
  await h.advance(UNDO_MS + POLL_MS);
  a.retry({ yes: false, confidence: 3 });
  await flush();
  expect([a.state, a.answer.yes, h.posted.length]).toEqual([
    'applied',
    true,
    1,
  ]);
  // Applied is final, so a further Yes or No is a new answer.
  expect(answerAction(a)).toBe('new');
});

// @scenario vouch-live-interfold: Earlier answer never posted
test('a new answer to a failed answer that was never posted is a new answer', async () => {
  const h = harness();
  const a = new LiveAnswer(input, { ...h.deps, session: () => null });
  await h.advance(UNDO_MS);
  expect([a.state, h.posted.length]).toEqual(['failed', 0]);
  expect(answerAction(a)).toBe('new');
  expect(answerAction(undefined)).toBe('new');
});

// @scenario vouch-live-interfold: Answer in flight
test('no new answer is offered while the last one is in flight', async () => {
  let release = () => {};
  const h = harness(
    [],
    (_u, _op, message) =>
      new Promise((resolve) => {
        release = () => resolve(hash(message));
      }),
  );
  const a = new LiveAnswer(input, h.deps);
  expect([a.state, answerAction(a)]).toEqual(['holding', 'none']);
  await h.advance(UNDO_MS);
  expect([a.state, answerAction(a)]).toEqual(['submitting', 'none']);
  release();
  await flush();
  expect([a.state, answerAction(a)]).toEqual(['submitted', 'none']);
  await h.advance(SETTLE_MS);
  expect([a.state, answerAction(a)]).toEqual(['unconfirmed', 'none']);
});

// A new Yes or No that fails to sign (signed out) must not change
// `answer`, which the screen shows: the earlier answer is the one the node
// may still apply.
test('a new value that fails to sign leaves the earlier answer shown', async () => {
  let current: typeof session | null = session;
  const h = harness([
    { state: 'FAILED', errorNum: 4 },
    { state: 'FAILED', errorNum: 4 },
    'APPLIED',
  ]);
  const a = new LiveAnswer(
    { ...input, yes: true },
    { ...h.deps, evaluator: 'me', session: () => current },
  );
  await h.advance(UNDO_MS + POLL_MS);
  current = null;
  a.retry({ yes: false, confidence: 3 });
  await flush();
  expect([a.state, a.answer.yes]).toEqual(['failed', true]);
  current = session;
  a.retry({ confidence: 3 });
  await flush();
  expect([a.state, a.answer.yes, h.posted.length]).toEqual([
    'applied',
    true,
    1,
  ]);
});

// @scenario vouch-live-interfold: Not found or unreachable
test('404s mixed with polls that get no response fail the answer after 5 minutes', async () => {
  const h = harness(
    Array.from({ length: 70 }, (_, i) => (i % 2 ? noResponse() : notFound())),
  );
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + SETTLE_MS);
  expect([a.state, a.error]).toEqual([
    'failed',
    'The node has no record of this answer',
  ]);
});

// @scenario vouch-live-interfold: Unreachable for 5 minutes
test('polls that never get a response leave the answer unconfirmed', async () => {
  const h = harness(Array.from({ length: 70 }, noResponse));
  const a = new LiveAnswer(input, h.deps);
  await h.advance(UNDO_MS + SETTLE_MS);
  expect(a.state).toBe('unconfirmed');
});
