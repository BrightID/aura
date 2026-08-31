export const DEFAULT_AURA_NODE_URL = "https://aura-node.brightid.org";
export const DEFAULT_AURA_TEST_NODE_URL = "https://aura-test.brightid.org";
export const DEFAULT_RECOVERY_URL = "https://recovery.brightid.org";

// Only recovery needs a same-origin rewrite (it sends no CORS headers).
export const RECOVERY_PROXY_PATH = "/brightid";
