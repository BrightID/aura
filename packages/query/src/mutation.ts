import type { ReactiveControllerHost } from 'lit'
import { defaultClient, QueryClient } from './client.js'
import type { MutationOptions, QueryStatus } from './types.js'

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * Lit reactive controller that mirrors TanStack Query's `useMutation` hook.
 *
 * @example
 * ```ts
 * class MyEl extends LitElement {
 *   #create = new Mutation(this, {
 *     mutationFn: (name: string) => fetch('/api/users', {
 *       method: 'POST',
 *       body: JSON.stringify({ name }),
 *     }).then(r => r.json()),
 *     onSuccess: () => client.invalidateQueries(['users']),
 *   })
 *
 *   render() {
 *     return html`
 *       <button @click=${() => this.#create.mutate('Alice')} ?disabled=${this.#create.isPending}>
 *         ${this.#create.isPending ? 'Creating…' : 'Create User'}
 *       </button>
 *     `
 *   }
 * }
 * ```
 */
export class Mutation<TData, TVariables = void, TError = Error, TContext = unknown> {
  // ─── Public state ─────────────────────────────────────────────────────────

  data: TData | undefined = undefined
  error: TError | null = null
  variables: TVariables | undefined = undefined
  status: MutationStatus = 'idle'
  context: TContext | undefined = undefined

  get isPending(): boolean { return this.status === 'pending' }
  get isSuccess(): boolean { return this.status === 'success' }
  get isError(): boolean   { return this.status === 'error' }
  get isIdle(): boolean    { return this.status === 'idle' }

  // ─── Private ──────────────────────────────────────────────────────────────

  private host: ReactiveControllerHost
  private options: MutationOptions<TData, TVariables, TError, TContext>
  private client: QueryClient

  constructor(
    host: ReactiveControllerHost,
    options: MutationOptions<TData, TVariables, TError, TContext>,
  ) {
    this.host = host
    this.options = options
    this.client = options.client ?? defaultClient
    host.addController(this)
  }

  // ─── Controller lifecycle (no-op — mutation is imperative) ────────────────

  hostConnected(): void {}
  hostDisconnected(): void {}

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Fire the mutation and return a promise that resolves with the result. */
  async mutate(variables: TVariables): Promise<TData | undefined> {
    return this.run(variables)
  }

  /** Reset back to idle state. */
  reset(): void {
    this.data = undefined
    this.error = null
    this.variables = undefined
    this.context = undefined
    this.status = 'idle'
    this.host.requestUpdate()
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async run(variables: TVariables, attempt = 0): Promise<TData | undefined> {
    this.variables = variables
    this.status = 'pending'
    this.data = undefined
    this.error = null
    this.host.requestUpdate()

    try {
      this.context = (await this.options.onMutate?.(variables)) as TContext
    } catch {
      // onMutate errors are ignored — mutation still proceeds
    }

    try {
      const data = await this.options.mutationFn(variables)
      this.data = data
      this.status = 'success'
      this.host.requestUpdate()
      this.options.onSuccess?.(data, variables, this.context as TContext)
      this.options.onSettled?.(data, null, variables, this.context as TContext)
      return data
    } catch (err) {
      const error = err as TError
      const maxRetries = this.options.retry ?? false
      if (maxRetries !== false && attempt < maxRetries) {
        const delay = resolveDelay(
          this.options.retryDelay ?? defaultRetryDelay,
          attempt,
        )
        await sleep(delay)
        return this.run(variables, attempt + 1)
      }

      this.error = error
      this.status = 'error'
      this.host.requestUpdate()
      this.options.onError?.(error, variables, this.context as TContext)
      this.options.onSettled?.(undefined, error, variables, this.context as TContext)
      return undefined
    }
  }
}

const defaultRetryDelay = (attempt: number): number =>
  Math.min(1000 * 2 ** attempt, 30_000)

function resolveDelay(delay: number | ((n: number) => number), attempt: number): number {
  return typeof delay === 'function' ? delay(attempt) : delay
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
