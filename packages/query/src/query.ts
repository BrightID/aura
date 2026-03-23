import type { ReactiveControllerHost } from 'lit'
import { defaultClient, hashKey, QueryClient } from './client.js'
import type { FetchStatus, QueryFunctionContext, QueryOptions, QueryStatus } from './types.js'

/**
 * Lit reactive controller that mirrors TanStack Query's `useQuery` hook.
 *
 * @example
 * ```ts
 * class MyEl extends LitElement {
 *   #users = new Query(this, {
 *     queryKey: ['users'],
 *     queryFn: () => fetch('/api/users').then(r => r.json()),
 *   })
 *
 *   render() {
 *     if (this.#users.isPending) return html`<p>Loading…</p>`
 *     if (this.#users.isError)  return html`<p>${this.#users.error?.message}</p>`
 *     return html`<ul>${this.#users.data?.map(u => html`<li>${u.name}</li>`)}</ul>`
 *   }
 * }
 * ```
 */
export class Query<TData, TError = Error> {
  // ─── Public state ─────────────────────────────────────────────────────────

  data: TData | undefined = undefined
  error: TError | null = null
  status: QueryStatus = 'pending'
  fetchStatus: FetchStatus = 'idle'

  get isPending(): boolean { return this.status === 'pending' }
  get isSuccess(): boolean { return this.status === 'success' }
  get isError(): boolean   { return this.status === 'error' }
  get isFetching(): boolean { return this.fetchStatus === 'fetching' }
  get isLoading(): boolean { return this.isPending && this.isFetching }

  // ─── Private ──────────────────────────────────────────────────────────────

  private host: ReactiveControllerHost
  private options: QueryOptions<TData, TError>
  private client: QueryClient
  private unsubscribe?: () => void
  private abortController?: AbortController
  private pollTimer?: ReturnType<typeof setInterval>
  private focusListener?: () => void

  constructor(host: ReactiveControllerHost, options: QueryOptions<TData, TError>) {
    this.host = host
    this.options = options
    this.client = options.client ?? defaultClient
    host.addController(this)
  }

  // ─── Controller lifecycle ─────────────────────────────────────────────────

  hostConnected(): void {
    this.subscribe()
    if (this.options.refetchOnWindowFocus ?? this.client.getDefaultRefetchOnWindowFocus()) {
      this.focusListener = () => { if (!this.isStale()) return; this.fetch() }
      window.addEventListener('focus', this.focusListener)
    }
  }

  hostDisconnected(): void {
    this.unsubscribe?.()
    this.abortController?.abort()
    clearInterval(this.pollTimer)
    if (this.focusListener) window.removeEventListener('focus', this.focusListener)
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Manually trigger a refetch regardless of staleness. */
  refetch(): Promise<TData | undefined> {
    return this.fetch()
  }

  /** Update options at runtime (e.g., change queryKey based on component state). */
  updateOptions(options: Partial<QueryOptions<TData, TError>>): void {
    const keyChanged = options.queryKey &&
      hashKey(options.queryKey) !== hashKey(this.options.queryKey)
    this.options = { ...this.options, ...options }
    this.client = this.options.client ?? defaultClient
    if (keyChanged) {
      this.unsubscribe?.()
      this.subscribe()
    } else if (options.enabled !== undefined) {
      if (options.enabled && this.isStale()) this.fetch()
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private get cacheKey(): string {
    return hashKey(this.options.queryKey)
  }

  private subscribe(): void {
    this.unsubscribe?.()
    const key = this.cacheKey
    this.unsubscribe = this.client.subscribe(key, () => this.syncFromCache())
    this.syncFromCache()
    if (this.options.enabled !== false && this.isStale()) {
      this.fetch()
    }
    this.setupPolling()
  }

  private syncFromCache(): void {
    const entry = this.client.getEntry<TData, TError>(this.cacheKey)
    if (!entry) return
    let changed = false
    if (this.data !== entry.data) { this.data = entry.data; changed = true }
    if (this.error !== entry.error) { this.error = entry.error; changed = true }
    if (this.status !== entry.status) { this.status = entry.status; changed = true }
    if (this.fetchStatus !== entry.fetchStatus) { this.fetchStatus = entry.fetchStatus; changed = true }

    // Apply placeholder when still pending and data is undefined
    if (this.status === 'pending' && this.data === undefined) {
      const ph = this.options.placeholderData
      const resolved = typeof ph === 'function'
        ? (ph as (prev: TData | undefined) => TData | undefined)(undefined)
        : ph
      if (resolved !== undefined) { this.data = resolved; changed = true }
    }

    if (changed) this.host.requestUpdate()
  }

  private isStale(): boolean {
    const entry = this.client.getEntry(this.cacheKey)
    if (!entry || entry.status === 'pending') return true
    const staleTime = this.options.staleTime ?? this.client.getDefaultStaleTime()
    return Date.now() - entry.updatedAt > staleTime
  }

  private async fetch(attempt = 0): Promise<TData | undefined> {
    if (this.options.enabled === false) return undefined

    this.abortController?.abort()
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    const ctx: QueryFunctionContext = { queryKey: this.options.queryKey, signal }

    this.client.setEntry<TData, TError>(this.cacheKey, { fetchStatus: 'fetching' })

    try {
      const data = await this.options.queryFn(ctx)
      if (signal.aborted) return undefined

      this.client.setEntry<TData, TError>(this.cacheKey, {
        data,
        error: null,
        status: 'success',
        fetchStatus: 'idle',
        updatedAt: Date.now(),
      })
      this.options.onSuccess?.(data)
      this.options.onSettled?.(data, null)
      return data
    } catch (err) {
      if (signal.aborted) return undefined

      const error = err as TError
      const maxRetries = this.options.retry ?? this.client.getDefaultRetry()
      if (maxRetries !== false && attempt < maxRetries) {
        const delay = resolveDelay(
          this.options.retryDelay ?? this.client.getDefaultRetryDelay(),
          attempt,
        )
        await sleep(delay)
        if (!signal.aborted) return this.fetch(attempt + 1)
        return undefined
      }

      this.client.setEntry<TData, TError>(this.cacheKey, {
        error,
        status: 'error',
        fetchStatus: 'idle',
        updatedAt: Date.now(),
      })
      this.options.onError?.(error)
      this.options.onSettled?.(undefined, error)
      return undefined
    }
  }

  private setupPolling(): void {
    clearInterval(this.pollTimer)
    const interval = this.options.refetchInterval
    if (interval && interval > 0) {
      this.pollTimer = setInterval(() => {
        if (this.options.enabled !== false) this.fetch()
      }, interval)
    }
  }
}

function resolveDelay(delay: number | ((n: number) => number), attempt: number): number {
  return typeof delay === 'function' ? delay(attempt) : delay
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
