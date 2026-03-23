import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Code } from "./_components/Code";
export const metadata: Metadata = {
  title: "@aura/query — Introduction",
  description:
    "TanStack-like reactive query and mutation controllers for Lit web components.",
};

export default function IntroPage() {
  return (
    <article className="prose">
      <h1>@aura/query</h1>
      <p className="prose-lead">
        Reactive data-fetching for Lit — the same mental model as TanStack
        Query, built as native <strong>Lit ReactiveControllers</strong> so they
        plug directly into any <code>LitElement</code> with no extra setup.
      </p>

      <h2>Why @aura/query?</h2>
      <p>
        Lit&apos;s <code>@lit/task</code> handles one-shot fetches, but it
        doesn&apos;t cache across components, deduplicate concurrent requests, or
        retry on failure. <code>@aura/query</code> fills that gap:
      </p>
      <ul>
        <li>
          <strong>Shared cache</strong> — multiple components on the same page
          that share a <code>queryKey</code> trigger only <em>one</em> network
          request.
        </li>
        <li>
          <strong>Stale-while-revalidate</strong> — data is served instantly
          from cache while a background refetch runs silently.
        </li>
        <li>
          <strong>Automatic retries</strong> — failed requests are retried with
          exponential back-off.
        </li>
        <li>
          <strong>Window-focus refetching</strong> — data is refreshed when the
          user returns to the tab.
        </li>
        <li>
          <strong>Mutations with cache invalidation</strong> — call{" "}
          <code>client.invalidateQueries()</code> after a write to
          transparently refetch stale data.
        </li>
        <li>
          <strong>Polling</strong> — pass <code>refetchInterval</code> to keep
          data live.
        </li>
      </ul>

      <h2>Installation</h2>
      <p>
        The package lives inside the Aura monorepo workspace — no separate
        install needed for apps in this repo.
      </p>
      <Code lang="bash">{`# From any app inside the monorepo — already available via workspace
# Just add it to your app's package.json dependencies:
"@aura/query": "*"`}</Code>

      <h2>Quick start</h2>
      <p>
        Everything revolves around two controllers and one client. Here is the
        minimal working example:
      </p>
      <Code filename="my-element.ts">{`import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { Query, Mutation, defaultClient } from '@aura/query'

interface User { id: string; name: string }

@customElement('user-list')
class UserList extends LitElement {
  // Fetch
  #users = new Query<User[]>(this, {
    queryKey: ['users'],
    queryFn: ({ signal }) =>
      fetch('/api/users', { signal }).then((r) => r.json()),
  })

  // Write
  #delete = new Mutation<void, string>(this, {
    mutationFn: (id) =>
      fetch(\`/api/users/\${id}\`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => defaultClient.invalidateQueries(['users']),
  })

  render() {
    if (this.#users.isLoading) return html\`<p>Loading…</p>\`
    if (this.#users.isError)
      return html\`<p>Error: \${this.#users.error?.message}</p>\`

    return html\`
      <ul>
        \${this.#users.data?.map(
          (u) => html\`
            <li>
              \${u.name}
              <button
                @click=\${() => this.#delete.mutate(u.id)}
                ?disabled=\${this.#delete.isPending}
              >
                Delete
              </button>
            </li>
          \`
        )}
      </ul>
    \`
  }
}`}</Code>

      <Callout type="tip">
        <code>Query</code> and <code>Mutation</code> call{" "}
        <code>host.requestUpdate()</code> whenever their state changes, so your{" "}
        <code>render()</code> is always in sync — no manual subscriptions
        needed.
      </Callout>

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/query/query-client">QueryClient</Link> — configure the
          global cache, seed data from SSR, and invalidate on demand.
        </li>
        <li>
          <Link href="/query/queries">Query controller</Link> — all options,
          state fields, and patterns.
        </li>
        <li>
          <Link href="/query/mutations">Mutation controller</Link> — optimistic
          updates, context, and error handling.
        </li>
        <li>
          <Link href="/query/api-reference">API Reference</Link> — complete
          TypeScript interfaces.
        </li>
      </ul>
    </article>
  );
}
