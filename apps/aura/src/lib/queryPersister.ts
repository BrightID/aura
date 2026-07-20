import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import type { Query } from "@tanstack/react-query"

const PERSISTED_KEYS = new Set([
  "connections-info",
  "connections",
  "brightid-profile",
  "gravatar",
])

export const PERSIST_MAX_AGE = 60_000

export const queryPersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "aura-rq-cache",
  throttleTime: 1000,
})

export const shouldDehydrateQuery = (
  query: Query<unknown, Error, unknown, readonly unknown[]>,
) => {
  const root = query.queryKey[0]
  return typeof root === "string" && PERSISTED_KEYS.has(root)
}
