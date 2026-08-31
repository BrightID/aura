// export const IS_PRODUCTION = import.meta.env.PROD
export const IS_PRODUCTION = false

export const __DEV__ = import.meta.env.DEV

// aura-node is CORS-open (`Access-Control-Allow-Origin: *`), so the browser
// calls it directly — no proxy needed. Override per-env via Vite env vars.
export const AURA_NODE_URL = IS_PRODUCTION
  ? (import.meta.env.VITE_AURA_NODE_URL ?? 'https://aura-node.brightid.org')
  : (import.meta.env.VITE_AURA_TEST_NODE_URL ?? 'https://aura-test.brightid.org')

export const CHANNEL_UPLOAD_RETRY_COUNT = 5 // max number of upload retries when upload failed
