import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { type PropsWithChildren, useEffect } from "react"
import { useLocation } from "react-router"
import UpdatePrompt from "@/components/Shared/UpdatePrompt"
import NodeApiGateContextProvider from "@/features/brightid/components/NodeApiGate"
import { queryClient } from "@/lib/queryClient"
import {
  PERSIST_MAX_AGE,
  queryPersister,
  shouldDehydrateQuery,
} from "@/lib/queryPersister"
import { useBrowserHistoryStore } from "@/store/browser-history.store"
import { migrateLegacyReduxStore } from "@/store/migration"

migrateLegacyReduxStore()

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: PERSIST_MAX_AGE,
        dehydrateOptions: { shouldDehydrateQuery },
      }}
    >
      <ReactQueryDevtools initialIsOpen={false} />
      <a-toaster />
      <UpdatePrompt />
      {children}
    </PersistQueryClientProvider>
  )
}

export function AppProviders({ children }: PropsWithChildren) {
  const location = useLocation()
  const setFirstPagePath = useBrowserHistoryStore((s) => s.setFirstPagePath)
  useEffect(() => {
    setFirstPagePath(location.pathname)
  }, [location.pathname, setFirstPagePath])

  return <NodeApiGateContextProvider>{children}</NodeApiGateContextProvider>
}
