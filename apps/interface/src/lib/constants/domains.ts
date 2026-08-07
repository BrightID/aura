// export const IS_PRODUCTION = import.meta.env.PROD
export const IS_PRODUCTION = false

export const __DEV__ = import.meta.env.DEV

// The app is deployed in production under the `/interface` path prefix (see
// vite.config.ts `base`), so this same-origin proxy path needs it too. In
// dev the app is served at `/`, matching vite.config.ts's (unprefixed) dev
// proxy, so no prefix is added there. Uses the real Vite prod flag, not the
// (currently hardcoded) `IS_PRODUCTION` above.
const BASE_PATH = import.meta.env.PROD ? '/interface' : ''

export const AURA_NODE_URL_PROXY = `${BASE_PATH}/auranode${IS_PRODUCTION ? '' : '-test'}`

export const AURA_NODE_URL = IS_PRODUCTION
  ? 'https://aura-node.brightid.org'
  : 'https://aura-test.brightid.org'

export const CHANNEL_UPLOAD_RETRY_COUNT = 5 // max number of upload retries when upload failed
