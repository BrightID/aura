import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import type { ParentComponent } from "solid-js"

const queryClient = new QueryClient()

const Providers: ParentComponent = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <a-toaster />
      {props.children}
    </QueryClientProvider>
  )
}

export default Providers
