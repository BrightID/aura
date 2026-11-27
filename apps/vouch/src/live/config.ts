// The live Interfold settings: two switches, `writes` and `reads`, and
// `nodeUrl`, read once from the build's env. Only the /live/ routes use them
// and talk to the node. Nothing enforces that: a practice screen that
// imported LIVE could call the node, so keep live code under src/live/ and
// the /live/ routes.

export interface LiveConfig {
  /** On: the build may send the signed-in person's Interfold answers. No route acts on it until the answer route is added (AUR-345). */
  writes: boolean;
  /** On: the build reads Interfold answers from the node. Independent of `writes`. */
  reads: boolean;
  /** The node every live request goes to, with no trailing slash. */
  nodeUrl: string;
}

/**
 * `writes` is on only when VITE_VOUCH_LIVE_WRITES is the string 'true', and
 * `reads` likewise with VITE_VOUCH_LIVE_READS.
 *
 * The node URL copies the rule in apps/core/src/shared/lib/urls.ts; change the
 * two together. A production build reads VITE_AURA_NODE_URL and defaults to
 * aura-node; any other build reads VITE_AURA_TEST_NODE_URL and defaults to
 * aura-test. A trailing slash is removed. Answers are signed with the key of
 * the person signed in to apps/core, which only the node core uses knows; any
 * other node would reject every answer.
 */
export function liveConfig(
  env: Record<string, string | undefined>,
): LiveConfig {
  return {
    writes: env.VITE_VOUCH_LIVE_WRITES === 'true',
    reads: env.VITE_VOUCH_LIVE_READS === 'true',
    nodeUrl: (env.MODE === 'production'
      ? env.VITE_AURA_NODE_URL || 'https://aura-node.brightid.org'
      : env.VITE_AURA_TEST_NODE_URL || 'https://aura-test.brightid.org'
    ).replace(/\/+$/, ''),
  };
}

export const LIVE = liveConfig(import.meta.env);

/**
 * The live route paths the router registers for a config. Only reads add one
 * today; with writes on and reads off the list is empty, until the answer
 * route is added (AUR-345).
 */
export function livePaths(config: LiveConfig): string[] {
  return config.reads ? ['/live/:operator/evidence'] : [];
}

/** A BrightID id: 43 characters of A-Z, a-z, 0-9, `-` and `_`. */
export const isOperatorId = (id: string) => /^[A-Za-z0-9_-]{43}$/.test(id);
