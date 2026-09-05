import { IS_PRODUCTION } from './env';
import {
  DEFAULT_AURA_NODE_URL,
  DEFAULT_AURA_TEST_NODE_URL,
  RECOVERY_PROXY_PATH,
} from './url-defaults';

const env = import.meta.env;

// Vite `base` is `/core/` in both dev and prod (host origin or standalone).
// The Solid router is mounted with this as its `base`, so
// `useLocation().pathname` is the full browser path *including* the base
// (`/core/home/player`) — route checks must strip it first.
const BASE_PATH = env.BASE_URL.replace(/\/$/, '') || '/core';

/**
 * Strip the router base from a full browser path so route-level checks
 * (`/home`, `/settings`, …) see app paths. The inverse of what `<A href>`
 * does when it resolves a link against the base.
 */
export function toRouterPath(path: string): string {
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    return path.slice(BASE_PATH.length) || '/';
  }
  return path;
}

// aura-node sends `Access-Control-Allow-Origin: *`, so the browser can call
// it directly — no proxy needed. Override per-env via Vite env vars.
export const AURA_NODE_URL: string = IS_PRODUCTION
  ? (env.VITE_AURA_NODE_URL ?? DEFAULT_AURA_NODE_URL)
  : (env.VITE_AURA_TEST_NODE_URL ?? DEFAULT_AURA_TEST_NODE_URL);

// recovery.brightid.org does NOT send CORS headers, so it must be reached
// same-origin through the single rewrite kept in vercel.json.
export const RECOVERY_URL_PROXY = `${BASE_PATH}${RECOVERY_PROXY_PATH}`;
