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

const DEFAULT_NODE_URL = 'https://aura-test.brightid.org';

/**
 * A switch is on only when its env value is the string 'true'. The node URL
 * defaults to aura-test, with any trailing slash removed.
 */
export function liveConfig(
  env: Record<string, string | undefined>,
): LiveConfig {
  return {
    writes: env.VITE_VOUCH_LIVE_WRITES === 'true',
    reads: env.VITE_VOUCH_LIVE_READS === 'true',
    nodeUrl: (env.VITE_AURA_NODE_URL || DEFAULT_NODE_URL).replace(/\/+$/, ''),
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
