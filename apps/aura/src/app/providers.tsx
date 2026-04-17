import { type PropsWithChildren } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import NodeApiGateContextProvider from "@/BrightID/components/NodeApiGate"
import UpdatePrompt from "@/components/Shared/UpdatePrompt"
import { BrowserHistoryContextProvider } from "@/contexts/BrowserHistoryContext"
import { SubjectsListContextProvider } from "@/contexts/SubjectsListContext"
import { queryClient } from "@/lib/queryClient"
import { migrateLegacyReduxStore } from "@/store/migration"

migrateLegacyReduxStore();

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
  return (
    <SubjectsListContextProvider>
      <NodeApiGateContextProvider>
        <BrowserHistoryContextProvider>
          {children}
        </BrowserHistoryContextProvider>
      </NodeApiGateContextProvider>
    </SubjectsListContextProvider>
  )
}
