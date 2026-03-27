# @aura/query

TanStack Query-inspired reactive controllers for [Lit](https://lit.dev). Provides `Query` and `Mutation` controllers with shared cache, automatic background refetching, retries, and polling — all wired directly into Lit's reactive update cycle.

## Installation

```sh
bun add @aura/query
```

Requires `lit >= 3.0.0` as a peer dependency.

---

## Quick start

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Query, Mutation, defaultClient } from '@aura/query'

@customElement('user-list')
class UserList extends LitElement {
  #users = new Query(this, {
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  #create = new Mutation(this, {
    mutationFn: (name: string) =>
      fetch('/api/users', { method: 'POST', body: JSON.stringify({ name }) }).then(r => r.json()),
    onSuccess: () => defaultClient.invalidateQueries(['users']),
  })

  render() {
    if (this.#users.isPending) return html`<p>Loading…</p>`
    if (this.#users.isError)  return html`<p>Error: ${this.#users.error?.message}</p>`

    return html`
      <ul>${this.#users.data.map(u => html`<li>${u.name}</li>`)}</ul>
      <button
        @click=${() => this.#create.mutate('Alice')}
        ?disabled=${this.#create.isPending}
      >
        ${this.#create.isPending ? 'Creating…' : 'Create user'}
      </button>
    `
  }
}
```

---

## `Query`

A Lit reactive controller that fetches and caches async data. Automatically fetches on connect, re-fetches when data goes stale, and keeps the host element in sync with the shared cache.

### Constructor

```ts
new Query(host: ReactiveControllerHost, options: QueryOptions)
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `queryKey` | `unknown[]` | required | Unique cache key. Deep-compared — changing it re-fetches. |
| `queryFn` | `(ctx: QueryFunctionContext) => Promise<TData>` | required | Async function that returns the data. Receives `{ queryKey, signal }`. |
| `enabled` | `boolean` | `true` | Set `false` to suspend fetching until a condition is met. |
| `staleTime` | `number` (ms) | `0` | How long fetched data is considered fresh. While fresh, no background refetch occurs. |
| `gcTime` | `number` (ms) | `300_000` (5 min) | How long an inactive cache entry is kept after all subscribers disconnect. |
| `retry` | `number \| false` | `3` | Number of retry attempts after a failed fetch. `false` disables retries. |
| `retryDelay` | `number \| ((attempt: number) => number)` | exponential backoff | Delay between retries. Default: `min(1000 * 2^attempt, 30_000)` → 1s, 2s, 4s … 30s. |
| `refetchInterval` | `number \| false` (ms) | `false` | Poll on a fixed interval while the controller is connected. |
| `refetchOnWindowFocus` | `boolean` | `true` | Re-fetch when the browser window regains focus (only if data is stale). |
| `placeholderData` | `TData \| ((prev) => TData)` | — | Shown immediately while the first fetch is in progress. |
| `client` | `QueryClient` | `defaultClient` | Override the shared client instance. |
| `onSuccess` | `(data: TData) => void` | — | Called after a successful fetch. |
| `onError` | `(error: TError) => void` | — | Called after all retries are exhausted. |
| `onSettled` | `(data, error) => void` | — | Called after every fetch attempt, success or failure. |

### State properties

| Property | Type | Description |
|---|---|---|
| `data` | `TData \| undefined` | Last successfully fetched value. |
| `error` | `TError \| null` | Error from the last failed attempt. |
| `status` | `'pending' \| 'success' \| 'error'` | Lifecycle status of the query result. |
| `fetchStatus` | `'fetching' \| 'idle'` | Whether a network request is currently in flight. |
| `isPending` | `boolean` | `status === 'pending'` |
| `isSuccess` | `boolean` | `status === 'success'` |
| `isError` | `boolean` | `status === 'error'` |
| `isFetching` | `boolean` | `fetchStatus === 'fetching'` |
| `isLoading` | `boolean` | `isPending && isFetching` — first load, no data yet. |

### Methods

```ts
// Manually trigger a refetch regardless of staleness
query.refetch(): Promise<TData | undefined>

// Update options at runtime (e.g. change queryKey based on component state)
query.updateOptions(partial: Partial<QueryOptions>): void
```

### Examples

**Conditional fetch** — only fetch when an ID is available:

```ts
#post = new Query(this, {
  queryKey: ['posts', this.postId],
  queryFn: ({ queryKey }) => fetchPost(queryKey[1] as string),
  enabled: !!this.postId,
})

// Later, when postId becomes available:
this.#post.updateOptions({ queryKey: ['posts', this.postId], enabled: true })
```

**Polling** — live data that refreshes every 5 seconds:

```ts
#stats = new Query(this, {
  queryKey: ['stats'],
  queryFn: fetchStats,
  refetchInterval: 5_000,
  staleTime: 4_000,
})
```

**Placeholder data** — show stale data while refreshing:

```ts
#users = new Query(this, {
  queryKey: ['users'],
  queryFn: fetchUsers,
  placeholderData: (prev) => prev, // keep showing previous results
})
```

**Custom retry strategy** — retry once, immediately:

```ts
#data = new Query(this, {
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 1,
  retryDelay: 0,
})
```

---

## `Mutation`

A Lit reactive controller for imperative side-effects (create, update, delete). Does not cache — each call is independent.

### Constructor

```ts
new Mutation(host, options: MutationOptions)
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `mutationFn` | `(variables: TVariables) => Promise<TData>` | required | The async function to run. |
| `retry` | `number \| false` | `false` | Retry attempts on failure. Disabled by default for mutations. |
| `retryDelay` | `number \| ((attempt: number) => number)` | exponential backoff | Delay between retries. |
| `onMutate` | `(variables) => Promise<TContext> \| TContext` | — | Runs before `mutationFn`. Return value is passed as `context` to other callbacks — useful for optimistic updates. |
| `onSuccess` | `(data, variables, context) => void` | — | Called on success. |
| `onError` | `(error, variables, context) => void` | — | Called on failure. |
| `onSettled` | `(data, error, variables, context) => void` | — | Called after every attempt. |
| `client` | `QueryClient` | `defaultClient` | Override the shared client instance. |

### State properties

| Property | Type | Description |
|---|---|---|
| `data` | `TData \| undefined` | Result of the last successful mutation. |
| `error` | `TError \| null` | Error from the last failed mutation. |
| `variables` | `TVariables \| undefined` | Variables passed to the last `mutate()` call. |
| `status` | `'idle' \| 'pending' \| 'success' \| 'error'` | Current mutation status. |
| `isPending` | `boolean` | Mutation is in flight. |
| `isSuccess` | `boolean` | Last mutation succeeded. |
| `isError` | `boolean` | Last mutation failed. |
| `isIdle` | `boolean` | No mutation has run yet (or after `reset()`). |

### Methods

```ts
// Trigger the mutation
mutation.mutate(variables: TVariables): Promise<TData | undefined>

// Reset status back to idle
mutation.reset(): void
```

### Optimistic update example

```ts
#toggleLike = new Mutation(this, {
  mutationFn: (id: string) => fetch(`/api/posts/${id}/like`, { method: 'POST' }).then(r => r.json()),

  onMutate: (id) => {
    // Save current state for rollback
    const previous = defaultClient.getQueryData<Post[]>(['posts'])
    // Optimistically update the cache
    defaultClient.setQueryData(['posts'], previous?.map(p =>
      p.id === id ? { ...p, liked: !p.liked } : p
    ))
    return { previous }
  },

  onError: (_err, _id, ctx) => {
    // Roll back on failure
    defaultClient.setQueryData(['posts'], ctx?.previous)
  },

  onSettled: () => {
    // Always re-sync from server
    defaultClient.invalidateQueries(['posts'])
  },
})
```

---

## `QueryClient`

The central cache and subscription manager. One `defaultClient` is exported and used by all controllers unless overridden.

### Creating a custom client

```ts
import { QueryClient } from '@aura/query'

const client = new QueryClient({
  defaultStaleTime: 30_000,       // 30s — data stays fresh for 30 seconds
  defaultGcTime: 10 * 60 * 1000, // 10 min cache retention
  defaultRetry: 2,
  defaultRetryDelay: 500,         // flat 500ms between retries
  defaultRefetchOnWindowFocus: false,
})
```

### Config options

| Option | Type | Default | Description |
|---|---|---|---|
| `defaultStaleTime` | `number` (ms) | `0` | Global stale time for all queries. |
| `defaultGcTime` | `number` (ms) | `300_000` | Global garbage collection delay. |
| `defaultRetry` | `number \| false` | `3` | Global retry count for queries. |
| `defaultRetryDelay` | `number \| ((attempt) => number)` | exponential backoff | Global retry delay. |
| `defaultRefetchOnWindowFocus` | `boolean` | `true` | Global window focus refetch toggle. |

### Methods

```ts
// Seed data into the cache (e.g. from SSR or a list response)
client.setQueryData(queryKey: unknown[], data: TData): void

// Read data from the cache without subscribing
client.getQueryData(queryKey: unknown[]): TData | undefined

// Mark matching entries as stale → active subscribers refetch
// Matches by key prefix: ['users'] invalidates ['users'], ['users', '1'], etc.
client.invalidateQueries(keyPrefix: unknown[]): void

// Remove entries from the cache entirely
client.removeQueries(keyPrefix: unknown[]): void
```

---

## Cache behaviour

- **Key hashing** — query keys are JSON-serialized with sorted object keys, so `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce the same cache entry.
- **Shared cache** — all `Query` controllers with the same key share one cache entry. A second component mounting will immediately receive the cached data and only re-fetch if it is stale.
- **GC** — when the last subscriber disconnects, the cache entry is scheduled for deletion after `gcTime`. Remounting before that timer fires restores the entry instantly.
- **Abort** — each `fetch()` call creates a new `AbortController`. Stale in-flight requests are cancelled when a new fetch starts or the controller disconnects.
