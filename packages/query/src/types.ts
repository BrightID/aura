import type { QueryClient } from './client.js'

export type QueryStatus = 'pending' | 'success' | 'error'
export type FetchStatus = 'fetching' | 'idle'

export interface QueryFunctionContext {
  queryKey: unknown[]
  signal: AbortSignal
}

export interface QueryOptions<TData, TError = Error> {
  /** Unique key for this query — array is deep-compared */
  queryKey: unknown[]
  /** Async function that resolves with data */
  queryFn: (ctx: QueryFunctionContext) => Promise<TData>
  /**
   * How long (ms) fetched data is considered fresh.
   * While fresh, no background refetch occurs. Default: 0 (always stale).
   */
  staleTime?: number
  /**
   * How long (ms) inactive cache entries are kept before garbage collection.
   * Default: 5 minutes.
   */
  gcTime?: number
  /** Number of retry attempts on failure. Default: 3. Set false to disable. */
  retry?: number | false
  /** Delay between retries in ms, or a function of attempt index. Default: exponential backoff. */
  retryDelay?: number | ((attempt: number) => number)
  /** Poll every N ms. Default: false (no polling). */
  refetchInterval?: number | false
  /** Re-fetch when the window regains focus. Default: true. */
  refetchOnWindowFocus?: boolean
  /** Set false to prevent fetching until condition is met. Default: true. */
  enabled?: boolean
  /** Static or derived placeholder shown while data loads for the first time. */
  placeholderData?: TData | ((prev: TData | undefined) => TData | undefined)
  /** QueryClient to use. Falls back to the global default client. */
  client?: QueryClient
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
  onSettled?: (data: TData | undefined, error: TError | null) => void
}

export interface MutationOptions<TData, TVariables = void, TError = Error, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>
  retry?: number | false
  retryDelay?: number | ((attempt: number) => number)
  /** Called before mutationFn — return value is passed as `context` to other callbacks. */
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

// ─── Internal cache types ───────────────────────────────────────────────────

export interface CacheEntry<TData = unknown, TError = Error> {
  data: TData | undefined
  error: TError | null
  status: QueryStatus
  fetchStatus: FetchStatus
  updatedAt: number
  /** How many Query controllers are currently subscribed */
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

