import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { type PropsWithChildren, useEffect } from "react"
import { useLocation } from "react-router"
import UpdatePrompt from "@/components/Shared/UpdatePrompt"
import NodeApiGateContextProvider from "@/features/brightid/components/NodeApiGate"
import { queryClient } from "@/lib/queryClient"
import { useBrowserHistoryStore } from "@/store/browser-history.store"
import { migrateLegacyReduxStore } from "@/store/migration"

migrateLegacyReduxStore()

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <a-toaster />
      <UpdatePrompt />
      {children}
    </QueryClientProvider>
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
