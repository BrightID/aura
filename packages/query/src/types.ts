import type { QueryClient } from "./client.js"

export type QueryStatus = "pending" | "success" | "error"
export type FetchStatus = "fetching" | "idle"

export interface QueryFunctionContext {
  queryKey: unknown[]
  signal: AbortSignal
}

export interface QueryOptions<TData, TError = Error> {
  queryKey: unknown[]
  queryFn: (ctx: QueryFunctionContext) => Promise<TData>
  staleTime?: number
  gcTime?: number
  retry?: number | false
  retryDelay?: number | ((attempt: number) => number)
  refetchInterval?: number | false
  refetchOnWindowFocus?: boolean
  enabled?: boolean
  placeholderData?: TData | ((prev: TData | undefined) => TData | undefined)
  client?: QueryClient
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
  onSettled?: (data: TData | undefined, error: TError | null) => void
}

export interface MutationOptions<
  TData,
  TVariables = void,
  TError = Error,
  TContext = unknown,
> {
  mutationFn: (variables: TVariables) => Promise<TData>
  retry?: number | false
  retryDelay?: number | ((attempt: number) => number)
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
  onError?: (error: TError, variables: TVariables, context: TContext) => void
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext,
  ) => void
  client?: QueryClient
}

export interface CacheEntry<TData = unknown, TError = Error> {
  data: TData | undefined
  error: TError | null
  status: QueryStatus
  fetchStatus: FetchStatus
  updatedAt: number
  observers: number
  gcTimer?: ReturnType<typeof setTimeout>
}

export interface QueryClientConfig {
  defaultStaleTime?: number
  defaultGcTime?: number
  defaultRetry?: number | false
  defaultRetryDelay?: number | ((attempt: number) => number)
  defaultRefetchOnWindowFocus?: boolean
}
