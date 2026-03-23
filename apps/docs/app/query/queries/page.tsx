import type { Metadata } from "next";
import { Callout, Code, Table } from "../_components/Code";
export const metadata: Metadata = {
  title: "Query controller — @aura/query",
  description: "Fetch, cache, and reactively render server data in Lit components.",
};

export default function QueriesPage() {
  return (
    <article className="prose">
      <h1>Query controller</h1>
      <p className="prose-lead">
        <code>Query</code> is a Lit{" "}
        <code>ReactiveController</code> that fetches data, caches it, and
        keeps your component in sync — automatically re-rendering when state
        changes.
      </p>

      <h2>Basic usage</h2>
      <Code filename="posts-list.ts">{`import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Query } from '@aura/query'

interface Post { id: string; title: string; body: string }

@customElement('posts-list')
class PostsList extends LitElement {
  #posts = new Query<Post[]>(this, {
    queryKey: ['posts'],
    queryFn: ({ signal }) =>
      fetch('/api/posts', { signal }).then((r) => r.json()),
  })

  render() {
    const { isPending, isError, isSuccess, data, error } = this.#posts

    if (isPending) return html\`<p>Loading…</p>\`
    if (isError)   return html\`<p>Error: \${error?.message}</p>\`

    return html\`
      <ul>
        \${data?.map((p) => html\`<li>\${p.title}</li>\`)}
      </ul>
    \`
  }
}`}</Code>

      <Callout type="tip">
        Always pass the <code>signal</code> from <code>queryFn</code> to your{" "}
        <code>fetch</code> call. This lets the controller cancel in-flight
        requests when the component disconnects or the query key changes.
      </Callout>

      <h2>State fields</h2>
      <Table
        headers={["Field", "Type", "Description"]}
        rows={[
          [<code key="a">status</code>, <code key="b">&quot;pending&quot; | &quot;success&quot; | &quot;error&quot;</code>, "Overall query lifecycle state."],
          [<code key="c">fetchStatus</code>, <code key="d">&quot;fetching&quot; | &quot;idle&quot;</code>, "Whether a network request is currently in flight."],
          [<code key="e">data</code>, "TData | undefined", "The resolved data, or undefined while pending."],
          [<code key="f">error</code>, "TError | null", "The caught error, or null on success."],
          [<code key="g">isPending</code>, "boolean", "status === 'pending'"],
          [<code key="h">isSuccess</code>, "boolean", "status === 'success'"],
          [<code key="i">isError</code>, "boolean", "status === 'error'"],
          [<code key="j">isFetching</code>, "boolean", "fetchStatus === 'fetching'"],
          [<code key="k">isLoading</code>, "boolean", "isPending && isFetching — first-load indicator."],
        ]}
      />

      <h2>Options</h2>
      <Table
        headers={["Option", "Type", "Default", "Description"]}
        rows={[
          [<code key="a">queryKey</code>, "unknown[]", "—", "Unique cache key. Change it to re-fetch different data."],
          [<code key="b">queryFn</code>, "(ctx) => Promise<TData>", "—", "Async function that returns data. Receives { queryKey, signal }."],
          [<code key="c">staleTime</code>, "number (ms)", "client default (0)", "Data freshness window. While fresh, no background refetch."],
          [<code key="d">gcTime</code>, "number (ms)", "client default (5 min)", "How long inactive entries stay in cache."],
          [<code key="e">enabled</code>, "boolean", "true", "Set false to skip fetching (e.g. wait for auth)."],
          [<code key="f">retry</code>, "number | false", "client default (3)", "Retry count on error."],
          [<code key="g">retryDelay</code>, "number | (n) => number", "exponential", "Delay between retries."],
          [<code key="h">refetchInterval</code>, "number | false", "false", "Poll interval in ms."],
          [<code key="i">refetchOnWindowFocus</code>, "boolean", "client default (true)", "Refetch when tab regains focus."],
          [<code key="j">placeholderData</code>, "TData | (prev) => TData", "—", "Data to show while first load is in flight."],
          [<code key="k">client</code>, "QueryClient", "defaultClient", "The cache instance to use."],
          [<code key="l">onSuccess</code>, "(data) => void", "—", "Called after a successful fetch."],
          [<code key="m">onError</code>, "(error) => void", "—", "Called after all retries are exhausted."],
          [<code key="n">onSettled</code>, "(data, error) => void", "—", "Called after either outcome."],
        ]}
      />

      <h2>Dynamic query keys</h2>
      <p>
        When a component property changes the key, call{" "}
        <code>updateOptions</code> inside <code>updated()</code>. The
        controller detects the key change, re-subscribes, and fetches fresh
        data automatically.
      </p>
      <Code>{`@customElement('user-profile')
class UserProfile extends LitElement {
  @property() userId = ''

  #user = new Query<User>(this, {
    queryKey: ['users', this.userId],
    queryFn: ({ signal }) =>
      fetch(\`/api/users/\${this.userId}\`, { signal }).then(r => r.json()),
    client,
  })

  updated(changed: Map<string, unknown>) {
    if (changed.has('userId')) {
      this.#user.updateOptions({
        queryKey: ['users', this.userId],
        queryFn: ({ signal }) =>
          fetch(\`/api/users/\${this.userId}\`, { signal }).then(r => r.json()),
      })
    }
  }
}`}</Code>

      <h2>Conditional fetching</h2>
      <p>
        Use <code>enabled: false</code> to defer fetching until a prerequisite
        is ready (e.g., the user is authenticated).
      </p>
      <Code>{`#profile = new Query<Profile>(this, {
  queryKey: ['profile', this.userId],
  queryFn: () => fetchProfile(this.userId),
  enabled: this.userId !== '',  // only fetch once we have an ID
  client,
})`}</Code>

      <h2>Polling</h2>
      <Code>{`// Re-fetch every 10 seconds
#stats = new Query<Stats>(this, {
  queryKey: ['stats'],
  queryFn: () => fetch('/api/stats').then(r => r.json()),
  refetchInterval: 10_000,
  client,
})`}</Code>

      <h2>Placeholder data</h2>
      <p>
        Show skeleton-like content while the first request is in flight by
        providing static or derived placeholder data.
      </p>
      <Code>{`#users = new Query<User[]>(this, {
  queryKey: ['users'],
  queryFn: fetchUsers,
  // Show cached list results while a detail query loads
  placeholderData: (prev) => prev,
  client,
})`}</Code>

      <h2>Manual refetch</h2>
      <Code>{`// E.g. a refresh button
html\`<button @click=\${() => this.#posts.refetch()}>Refresh</button>\``}</Code>
    </article>
  );
}
