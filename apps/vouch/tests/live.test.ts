import { describe, expect, test } from 'bun:test';
import { isOperatorId, liveConfig, livePaths } from '@/live/config';
import { interfoldEvidence, readEvidence } from '@/live/evidence';

const X = 'xw-l03CAhcY3OfGrrLXMwruLMuNLbRlPGyt6NGS-DEQ';

describe('live switches', () => {
  // Each @scenario tag names the spec scenario its test checks; spec-trace's CI
  // step fails when a tag names no scenario (see AGENTS.md).
  // @scenario vouch-live-interfold: Both switches off
  test('with neither switch set, no live route exists', () => {
    expect(livePaths(liveConfig({}))).toEqual([]);
  });

  // @scenario vouch-live-interfold: A value other than true
  test('a switch is on only when it is exactly true', () => {
    for (const value of ['1', 'TRUE', 'yes', ' true'])
      expect(
        liveConfig({
          VITE_VOUCH_LIVE_WRITES: value,
          VITE_VOUCH_LIVE_READS: value,
        }),
      ).toMatchObject({
        writes: false,
        reads: false,
      });
  });

  // @scenario vouch-live-interfold: Reads on, writes off
  test('reads on registers the evidence route only', () => {
    expect(livePaths(liveConfig({ VITE_VOUCH_LIVE_READS: 'true' }))).toEqual([
      '/live/:operator/evidence',
    ]);
  });

  // @scenario vouch-live-interfold: Unset in a production build
  // The second expect goes beyond the scenario: a set URL loses its trailing slash.
  test('a production build defaults to aura-node, as apps/core does', () => {
    expect(liveConfig({ MODE: 'production' }).nodeUrl).toBe(
      'https://aura-node.brightid.org',
    );
    expect(
      liveConfig({
        MODE: 'production',
        VITE_AURA_NODE_URL: 'https://n.example/',
      }).nodeUrl,
    ).toBe('https://n.example');
  });

  // @scenario vouch-live-interfold: Unset in a development build
  // The first expect is the scenario: VITE_AURA_TEST_NODE_URL unset, so
  // VITE_AURA_NODE_URL is ignored. The second, with no MODE, also a non-production
  // build, shows the test variable is read and loses its trailing slash.
  test('any other build reads the test node variable, defaulting to aura-test', () => {
    expect(
      liveConfig({
        MODE: 'development',
        VITE_AURA_NODE_URL: 'https://n.example',
      }).nodeUrl,
    ).toBe('https://aura-test.brightid.org');
    expect(
      liveConfig({ VITE_AURA_TEST_NODE_URL: 'https://t.example/' }).nodeUrl,
    ).toBe('https://t.example');
  });
});

// @scenario vouch-live-interfold: Malformed id
test('an operator id must be a BrightID id', () => {
  expect(isOperatorId(X)).toBe(true);
  for (const id of ['abc/../x', X.slice(1), `${X}a`, `${X.slice(1)}/`, ''])
    expect(isOperatorId(id)).toBe(false);
});

// @scenario vouch-live-interfold: Mixed response
test('only current valid Interfold answers count', () => {
  const answers = interfoldEvidence({
    data: {
      connections: [
        {
          id: 'e1',
          auraEvaluations: [
            {
              domain: 'BrightID',
              category: 'subject',
              evaluation: 'positive',
              confidence: 4,
              modified: 5,
            },
            {
              domain: 'Interfold',
              category: 'Uptime',
              evaluation: 'positive',
              confidence: 4,
              modified: 5,
            },
            {
              domain: 'Interfold',
              category: 'Keyholder',
              evaluation: 'positive',
              confidence: 0,
              modified: 5,
            },
            {
              domain: 'Interfold',
              category: 'Keyholder',
              evaluation: 'positive',
              confidence: 2.5,
              modified: 5,
            },
            {
              domain: 'interfold',
              category: 'Keyholder',
              evaluation: 'positive',
              confidence: 3,
              modified: 5,
            },
            {
              domain: 'Interfold',
              category: 'Keyholder',
              evaluation: 'negative',
              confidence: 3,
              modified: 7,
            },
            {
              domain: 'Interfold',
              category: 'Keyholder',
              evaluation: 'positive',
              confidence: 2,
              modified: 6,
            },
          ],
        },
        { id: 'e2', auraEvaluations: [] },
        { id: 'e3' },
        {
          id: 'e4',
          auraEvaluations: [
            {
              domain: 'Interfold',
              category: 'Disclosure',
              evaluation: 'positive',
              confidence: 4,
              modified: 3,
            },
          ],
        },
      ],
    },
  });
  expect(answers).toEqual([
    {
      evaluator: 'e1',
      question: 'Keyholder',
      yes: false,
      confidence: 3,
      modified: 7,
    },
    {
      evaluator: 'e4',
      question: 'Disclosure',
      yes: true,
      confidence: 4,
      modified: 3,
    },
  ]);
});

// @scenario vouch-live-interfold: Node read fails
test('a failed read throws and yields no answers', async () => {
  const failing = async () => {
    throw new Error('The node answered 502');
  };
  await expect(readEvidence('https://n', X, failing)).rejects.toThrow('502');
});
