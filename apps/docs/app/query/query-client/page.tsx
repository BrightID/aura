import type { Metadata } from "next";
import { Callout, Code, Table } from "../_components/Code";
export const metadata: Metadata = {
  title: "QueryClient — @aura/query",
  description:
    "Configure and use the QueryClient to manage the shared query cache.",
};

export default function QueryClientPage() {
  return (
    <article className="prose">
      <h1>QueryClient</h1>
      <p className="prose-lead">
        The <code>QueryClient</code> is the central cache that all{" "}
        <code>Query</code> and <code>Mutation</code> controllers read from and
        write to. Create one per application and share it across components.
      </p>

      <h2>Creating a client</h2>
      <p>
        Export a single client from a dedicated module so every component
        imports the same instance.
      </p>
      <Code filename="src/query-client.ts">{`import { QueryClient } from '@aura/query'

export const client = new QueryClient({
  defaultStaleTime: 60_000,          // 1 minute fresh window
  defaultGcTime: 10 * 60 * 1000,    // 10 minutes before GC
  defaultRetry: 3,                   // retry failed requests 3×
  defaultRefetchOnWindowFocus: true, // refresh when tab regains focus
})`}</Code>

      <p>
        Then pass it to each controller via the <code>client</code> option:
      </p>
      <Code filename="my-element.ts">{`import { client } from './query-client'
import { Query } from '@aura/query'

class MyEl extends LitElement {
  #posts = new Query(this, {
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
    client, // ← ties this query to the shared cache
  })
}`}</Code>

      <Callout type="note">
        If you omit the <code>client</code> option, controllers fall back to the
        module-level <code>defaultClient</code> exported from{" "}
        <code>@aura/query</code>. For simple apps this is fine — just be aware
        that all controllers without an explicit client share one global cache.
      </Callout>

      <h2>Configuration options</h2>
      <Table
        headers={["Option", "Type", "Default", "Description"]}
        rows={[
          [
            <code key="a">defaultStaleTime</code>,
            "number (ms)",
            "0",
            "How long fetched data is considered fresh. While fresh, no background refetch occurs.",
          ],
          [
            <code key="b">defaultGcTime</code>,
            "number (ms)",
            "300 000 (5 min)",
            "How long an inactive cache entry is kept before being garbage-collected.",
          ],
          [
            <code key="c">defaultRetry</code>,
            "number | false",
            "3",
            "Number of automatic retries on failure. Pass false to disable.",
          ],
          [
            <code key="d">defaultRetryDelay</code>,
            "number | (attempt) => number",
            "exponential",
            "Delay between retries. Defaults to min(1000 × 2ⁿ, 30 000) ms.",
          ],
          [
            <code key="e">defaultRefetchOnWindowFocus</code>,
            "boolean",
            "true",
            "Refetch stale queries when the browser window regains focus.",
          ],
        ]}
      />

      <h2>Seeding data (SSR / prefetch)</h2>
      <p>
        Use <code>setQueryData</code> to inject data into the cache before a
        component mounts — useful when data is already available from a server
        response or a parent list query.
      </p>
      <Code>{`// After fetching a list, seed individual item entries so detail pages
// load instantly without a separate request.
const users = await fetchUsers()

users.forEach((user) => {
  client.setQueryData(['users', user.id], user)
})

// Read it back without triggering a network call
const cached = client.getQueryData<User>(['users', '42'])`}</Code>

      <h2>Invalidating queries</h2>
      <p>
        After a mutation you usually want to refetch related queries.{" "}
        <code>invalidateQueries</code> marks matching cache entries as stale and
        notifies all active subscribers so they refetch automatically.
      </p>
      <Code>{`// Invalidate everything under the 'users' prefix
client.invalidateQueries(['users'])

// More specific — only invalidate a single user entry
client.invalidateQueries(['users', userId])`}</Code>

      <p>
        The key prefix match works on the parsed array: passing{" "}
        <code>['users']</code> will match <code>['users']</code>,{" "}
        <code>['users', '1']</code>, <code>['users', '1', 'posts']</code>, etc.
      </p>

      <h2>Removing queries</h2>
      <p>
        <code>removeQueries</code> deletes entries from the cache entirely (and
        their subscriber lists). Use this when you want to force a cold fetch on
        next mount rather than serving stale data.
      </p>
      <Code>{`// Remove all user cache entries on logout
client.removeQueries(['users'])`}</Code>

      <h2>Using the default client</h2>
      <p>
        For quick prototypes or small apps you can skip creating an explicit
        client and rely on the shared module-level instance:
      </p>
      <Code>{`import { defaultClient } from '@aura/query'

// Invalidate after a mutation
defaultClient.invalidateQueries(['posts'])`}</Code>

      <Callout type="warn">
        Avoid mixing explicit clients and <code>defaultClient</code> for the
        same query keys — they maintain separate caches and will not share
        state.
      </Callout>
    </article>
  );
}
