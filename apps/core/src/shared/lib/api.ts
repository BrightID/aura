import { AURA_NODE_URL, RECOVERY_URL_PROXY } from "@/shared/lib/urls";

// aura-node is CORS-open: call it directly from the browser.
export const NODE_API_BASE = AURA_NODE_URL;
export const RECOVERY_API_BASE = RECOVERY_URL_PROXY;

export { getJson, getText, postJson } from "@aura/domain/http";
