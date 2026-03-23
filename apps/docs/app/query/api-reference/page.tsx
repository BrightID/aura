import type { Metadata } from "next";
import { Code, Table } from "../_components/Code";
export const metadata: Metadata = {
  title: "API Reference — @aura/query",
  description: "Complete TypeScript interface reference for @aura/query.",
};

export default function ApiReferencePage() {
  return (
    <article className="prose">
      <h1>API Reference</h1>
      <p className="prose-lead">
        Complete TypeScript signatures for every export in{" "}
        <code>@aura/query</code>.
      </p>

      {/* ─── QueryClient ──────────────────────────────────────────────────── */}
      <h2>QueryClient</h2>
      <Code>{`class QueryClient {
  constructor(config?: QueryClientConfig)

  // Cache read / write
  getEntry<TData, TError>(key: string): CacheEntry<TData, TError> | undefined
  setEntry<TData, TError>(key: string, patch: Partial<CacheEntry<TData, TError>>): void

  // Public data API
  setQueryData<TData>(queryKey: unknown[], data: TData): void
  getQueryData<TData>(queryKey: unknown[]): TData | undefined

  // Subscriptions (used internally by controllers)
  subscribe(key: string, listener: () => void): () => void   // returns unsubscribe fn

  // Invalidation
  invalidateQueries(keyPrefix: unknown[]): void
  removeQueries(keyPrefix: unknown[]): void

  // Config accessors (used by controllers as fallback defaults)
  getDefaultStaleTime(): number
  getDefaultRetry(): number | false
  getDefaultRetryDelay(): (attempt: number) => number
  getDefaultRefetchOnWindowFocus(): boolean
}`}</Code>

      <h3>QueryClientConfig</h3>
      <Table
        headers={["Property", "Type", "Default"]}
        rows={[
          [<code key="a">defaultStaleTime</code>, "number (ms)", "0"],
          [<code key="b">defaultGcTime</code>, "number (ms)", "300 000"],
          [<code key="c">defaultRetry</code>, "number | false", "3"],
          [<code key="d">defaultRetryDelay</code>, "number | (attempt) => number", "exponential backoff"],
          [<code key="e">defaultRefetchOnWindowFocus</code>, "boolean", "true"],
        ]}
      />

      {/* ─── Query ────────────────────────────────────────────────────────── */}
      <h2>Query&lt;TData, TError&gt;</h2>
      <Code>{`class Query<TData, TError = Error> implements ReactiveController {
  // State (read-only at runtime — updated by the controller)
  readonly data: TData | undefined
  readonly error: TError | null
  readonly status: 'pending' | 'success' | 'error'
  readonly fetchStatus: 'fetching' | 'idle'

  // Derived booleans
  readonly isPending: boolean   // status === 'pending'
  readonly isSuccess: boolean   // status === 'success'
  readonly isError: boolean     // status === 'error'
  readonly isFetching: boolean  // fetchStatus === 'fetching'
  readonly isLoading: boolean   // isPending && isFetching

  constructor(host: ReactiveControllerHost, options: QueryOptions<TData, TError>)

  // Imperatively trigger a fresh fetch (ignores staleness)
  refetch(): Promise<TData | undefined>

  // Update options at runtime (e.g. change queryKey on prop change)
  updateOptions(patch: Partial<QueryOptions<TData, TError>>): void

  // Lifecycle (called by Lit automatically)
  hostConnected(): void
  hostDisconnected(): void
}`}</Code>

      <h3>QueryOptions&lt;TData, TError&gt;</h3>
      <Table
        headers={["Property", "Type", "Required", "Default"]}
        rows={[
          [<code key="a">queryKey</code>, "unknown[]", "yes", "—"],
          [<code key="b">queryFn</code>, "(ctx: QueryFunctionContext) => Promise<TData>", "yes", "—"],
          [<code key="c">staleTime</code>, "number (ms)", "no", "client default"],
          [<code key="d">gcTime</code>, "number (ms)", "no", "client default"],
          [<code key="e">enabled</code>, "boolean", "no", "true"],
          [<code key="f">retry</code>, "number | false", "no", "client default"],
          [<code key="g">retryDelay</code>, "number | (n) => number", "no", "client default"],
          [<code key="h">refetchInterval</code>, "number | false", "no", "false"],
          [<code key="i">refetchOnWindowFocus</code>, "boolean", "no", "client default"],
          [<code key="j">placeholderData</code>, "TData | (prev) => TData", "no", "—"],
          [<code key="k">client</code>, "QueryClient", "no", "defaultClient"],
          [<code key="l">onSuccess</code>, "(data: TData) => void", "no", "—"],
          [<code key="m">onError</code>, "(error: TError) => void", "no", "—"],
          [<code key="n">onSettled</code>, "(data, error) => void", "no", "—"],
        ]}
      />

      <h3>QueryFunctionContext</h3>
      <Code>{`interface QueryFunctionContext {
  queryKey: unknown[]   // the key passed to QueryOptions
  signal: AbortSignal   // aborted when component disconnects or key changes
}`}</Code>

      {/* ─── Mutation ─────────────────────────────────────────────────────── */}
      <h2>Mutation&lt;TData, TVariables, TError, TContext&gt;</h2>
      <Code>{`class Mutation<
  TData,
  TVariables = void,
  TError = Error,
  TContext = unknown
> implements ReactiveController {
  // State
  readonly data: TData | undefined
  readonly error: TError | null
  readonly variables: TVariables | undefined
  readonly status: 'idle' | 'pending' | 'success' | 'error'
  readonly context: TContext | undefined

  // Derived booleans
  readonly isIdle: boolean
  readonly isPending: boolean
  readonly isSuccess: boolean
  readonly isError: boolean

  constructor(
    host: ReactiveControllerHost,
    options: MutationOptions<TData, TVariables, TError, TContext>
  )

  mutate(variables: TVariables): Promise<TData | undefined>
  reset(): void

  // Lifecycle
  hostConnected(): void
  hostDisconnected(): void
}`}</Code>

      <h3>MutationOptions</h3>
      <Table
        headers={["Property", "Type", "Required", "Default"]}
        rows={[
          [<code key="a">mutationFn</code>, "(vars: TVariables) => Promise<TData>", "yes", "—"],
          [<code key="b">retry</code>, "number | false", "no", "false"],
          [<code key="c">retryDelay</code>, "number | (n) => number", "no", "exponential"],
          [<code key="d">onMutate</code>, "(vars) => Promise<TContext> | TContext", "no", "—"],
          [<code key="e">onSuccess</code>, "(data, vars, ctx) => void", "no", "—"],
          [<code key="f">onError</code>, "(error, vars, ctx) => void", "no", "—"],
          [<code key="g">onSettled</code>, "(data, error, vars, ctx) => void", "no", "—"],
          [<code key="h">client</code>, "QueryClient", "no", "defaultClient"],
        ]}
      />

      {/* ─── CacheEntry ───────────────────────────────────────────────────── */}
      <h2>CacheEntry</h2>
      <Code>{`interface CacheEntry<TData = unknown, TError = Error> {
  data: TData | undefined
  error: TError | null
  status: 'pending' | 'success' | 'error'
  fetchStatus: 'fetching' | 'idle'
  updatedAt: number          // Date.now() of last successful fetch
  observers: number          // active Query controllers subscribed to this key
  gcTimer?: ReturnType<typeof setTimeout>
}`}</Code>

      {/* ─── Helpers ──────────────────────────────────────────────────────── */}
      <h2>Utilities</h2>
      <Code>{`// Stable string serialisation of any query key array
hashKey(key: unknown[]): string

// Module-level singleton client (used when no client option is provided)
const defaultClient: QueryClient`}</Code>
    </article>
  );
}
