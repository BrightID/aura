import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient, type Query } from "@tanstack/solid-query"
import { PersistQueryClientProvider } from "@tanstack/solid-query-persist-client"
import localforage from "localforage"
import { createEffect, type ParentComponent } from "solid-js"
import OpNotifications from "@/components/evaluation/op-notifications"
import NotificationsChecker from "@/components/notifications/notifications-checker"
import UpdatePrompt from "@/components/shared/update-prompt"
import { preferencesStore } from "@/store/preferences"
import { isNotFound } from "@aura/domain/http"

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24 // 24h

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // keep cache around long enough to be restored from disk after a refresh
      gcTime: PERSIST_MAX_AGE,
      // 404 = "no profile on the node yet" — a real answer, don't retry it
      retry: (failureCount, error) => !isNotFound(error) && failureCount < 3,
    },
  },
})

// Dedicated IndexedDB store so the query cache doesn't clash with other state.
const cacheStore = localforage.createInstance({
  name: "aura",
  storeName: "query-cache",
})

const PERSIST_KEY = "aura-query-cache"

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => cacheStore.getItem<string>(key),
    setItem: (key, value) => cacheStore.setItem(key, value),
    removeItem: (key) => cacheStore.removeItem(key),
  },
  key: PERSIST_KEY,
})

/** Wipe the query cache (memory + persisted) — call on logout. */
export async function clearQueryCache(): Promise<void> {
  queryClient.clear()
  await cacheStore.removeItem(PERSIST_KEY)
}

// Allowlist: only these query roots are safe to write to disk. Everything else
// (decrypted backups, photos, anything password-keyed) stays in memory only.
// Opt-in by design — a new query is non-persisted until explicitly added here.
const PERSISTABLE_KEYS = new Set([
  "connections",
  "brightid-profile",
])

function shouldDehydrateQuery(query: Query): boolean {
  const root = query.queryKey?.[0]
  if (typeof root !== "string" || !PERSISTABLE_KEYS.has(root)) return false
  return query.state.status === "success"
}

const Providers: ParentComponent = (props) => {
  // Apply the persisted theme to the document root (tailwind `.dark` variant).
  createEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      preferencesStore.theme === "dark",
    )
  })

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE,
        dehydrateOptions: { shouldDehydrateQuery },
        // Drop persisted caches from older app versions (shape changes).
        buster: __APP_VERSION__,
      }}
      // Stale-while-revalidate across reloads: the restored cache paints the
      // first frame, then everything is marked stale so active queries
      // refetch immediately instead of trusting disk data as fresh.
      onSuccess={() => queryClient.invalidateQueries()}
    >
      <a-toaster />
      <UpdatePrompt />
      <OpNotifications />
      <NotificationsChecker />
      {props.children}
    </PersistQueryClientProvider>
  )
}

export default Providers
