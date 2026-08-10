import { IS_PRODUCTION } from "./env";
import {
  AURA_NODE_PROXY_PATH,
  AURA_TEST_NODE_PROXY_PATH,
  DEFAULT_AURA_NODE_URL,
  DEFAULT_AURA_TEST_NODE_URL,
  RECOVERY_PROXY_PATH,
} from "./url-defaults";

const env = import.meta.env;

// The app is deployed in production under the `/core` path prefix (see
// vite.config.ts `base`); these proxy paths are same-origin browser-facing
// URLs, so they need the prefix too. In dev the app is served at `/`, so no
// prefix is added there.
const BASE_PATH = IS_PRODUCTION ? "/core" : "";

export const AURA_NODE_URL_PROXY = IS_PRODUCTION
  ? `${BASE_PATH}${AURA_NODE_PROXY_PATH}`
  : AURA_TEST_NODE_PROXY_PATH;

export const AURA_NODE_URL: string = IS_PRODUCTION
  ? (env.VITE_AURA_NODE_URL ?? DEFAULT_AURA_NODE_URL)
  : (env.VITE_AURA_TEST_NODE_URL ?? DEFAULT_AURA_TEST_NODE_URL);

export const RECOVERY_URL_PROXY = `${BASE_PATH}${RECOVERY_PROXY_PATH}`;
