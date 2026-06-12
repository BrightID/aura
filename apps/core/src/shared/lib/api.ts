import { AURA_NODE_URL_PROXY, RECOVERY_URL_PROXY } from "@/shared/lib/urls";

export const NODE_API_BASE = AURA_NODE_URL_PROXY;
export const RECOVERY_API_BASE = RECOVERY_URL_PROXY;

export { getJson, getText, postJson } from "@aura/domain/http";
