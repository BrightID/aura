import type { Metadata } from "next";
import { Callout, Code, Table } from "../_components/Code";
export const metadata: Metadata = {
  title: "Mutation controller — @aura/query",
  description: "Create, update, and delete data from Lit components with automatic cache invalidation.",
};

export default function MutationsPage() {
  return (
    <article className="prose">
      <h1>Mutation controller</h1>
      <p className="prose-lead">
        <code>Mutation</code> is a Lit <code>ReactiveController</code> for
        imperative write operations — POST, PUT, DELETE — with built-in loading
        state, error handling, and cache invalidation hooks.
      </p>

      <h2>Basic usage</h2>
      <Code filename="create-post.ts">{`import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Mutation } from '@aura/query'
import { client } from './query-client'

interface Post { id: string; title: string }

@customElement('create-post')
class CreatePost extends LitElement {
  @state() private title = ''

  #create = new Mutation<Post, { title: string }>(this, {
    mutationFn: (vars) =>
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      }).then((r) => r.json()),

    onSuccess: () => {
      client.invalidateQueries(['posts']) // refetch the list
      this.title = ''                      // reset the form
    },

    onError: (err) => console.error('Create failed:', err),
    client,
  })

  render() {
    return html\`
      <input
        .value=\${this.title}
        @input=\${(e: InputEvent) =>
          (this.title = (e.target as HTMLInputElement).value)}
        placeholder="Post title"
      />
      <button
        @click=\${() => this.#create.mutate({ title: this.title })}
        ?disabled=\${this.#create.isPending}
      >
        \${this.#create.isPending ? 'Creating…' : 'Create post'}
      </button>

      \${this.#create.isError
        ? html\`<p class="error">\${this.#create.error?.message}</p>\`
        : ''}

      \${this.#create.isSuccess
        ? html\`<p class="success">Created "\${this.#create.data?.title}"!</p>\`
        : ''}
    \`
  }
}`}</Code>

      <h2>State fields</h2>
      <Table
        headers={["Field", "Type", "Description"]}
        rows={[
          [<code key="a">status</code>, <code key="b">&quot;idle&quot; | &quot;pending&quot; | &quot;success&quot; | &quot;error&quot;</code>, "Current lifecycle state."],
          [<code key="c">data</code>, "TData | undefined", "Resolved data from the last successful call."],
          [<code key="d">error</code>, "TError | null", "Error from the last failed call."],
          [<code key="e">variables</code>, "TVariables | undefined", "The argument passed to the last mutate() call."],
          [<code key="f">isIdle</code>, "boolean", "No call has been made yet (or after reset())."],
          [<code key="g">isPending</code>, "boolean", "A call is in flight."],
          [<code key="h">isSuccess</code>, "boolean", "The last call succeeded."],
          [<code key="i">isError</code>, "boolean", "The last call failed."],
        ]}
      />

      <h2>Options</h2>
      <Table
        headers={["Option", "Type", "Default", "Description"]}
        rows={[
          [<code key="a">mutationFn</code>, "(vars: TVariables) => Promise<TData>", "—", "The async function that performs the write."],
          [<code key="b">retry</code>, "number | false", "false", "Retries on failure. Mutations don't retry by default."],
          [<code key="c">retryDelay</code>, "number | (n) => number", "exponential", "Delay between retries."],
          [<code key="d">onMutate</code>, "(vars) => TContext", "—", "Called before mutationFn. Return value is the context passed to other callbacks."],
          [<code key="e">onSuccess</code>, "(data, vars, ctx) => void", "—", "Called after a successful mutation."],
          [<code key="f">onError</code>, "(error, vars, ctx) => void", "—", "Called after failure (post-retry)."],
          [<code key="g">onSettled</code>, "(data, error, vars, ctx) => void", "—", "Called after either outcome."],
          [<code key="h">client</code>, "QueryClient", "defaultClient", "Cache to invalidate/seed."],
        ]}
      />

      <h2>Optimistic updates</h2>
      <p>
        Use <code>onMutate</code> to update the cache optimistically before the
        server responds. If the mutation fails, roll back using the snapshot
        saved in <code>context</code>.
      </p>
      <Code>{`#toggleLike = new Mutation<void, string>(this, {
  mutationFn: (postId) =>
    fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' }),

  onMutate: (postId) => {
    // 1. Snapshot the current value
    const previous = client.getQueryData<Post>(['posts', postId])

    // 2. Optimistically update the cache
    if (previous) {
      client.setQueryData(['posts', postId], {
        ...previous,
        likes: previous.likes + 1,
      })
    }

    // 3. Return snapshot as context for rollback
    return { previous, postId }
  },

  onError: (_err, _postId, context) => {
    // Roll back on failure
    if (context?.previous) {
      client.setQueryData(['posts', context.postId], context.previous)
    }
  },

  onSettled: (_data, _err, postId) => {
    // Always sync with server after settle
    client.invalidateQueries(['posts', postId])
  },

  client,
})`}</Code>

      <Callout type="note">
        <code>onMutate</code> runs synchronously before <code>mutationFn</code>.
        The value it returns becomes the <code>context</code> argument in{" "}
        <code>onSuccess</code>, <code>onError</code>, and{" "}
        <code>onSettled</code>.
      </Callout>

      <h2>Resetting state</h2>
      <p>
        Call <code>reset()</code> to clear the mutation back to its idle state
        — useful after displaying a success/error message.
      </p>
      <Code>{`html\`
  \${this.#create.isSuccess
    ? html\`
        <p>Post created!</p>
        <button @click=\${() => this.#create.reset()}>Create another</button>
      \`
    : html\`<button @click=\${() => this.#create.mutate(...)}>Create</button>\`
  }
\``}</Code>

      <h2>Delete with confirmation</h2>
      <p>A common pattern — disable the button while the request is in flight:</p>
      <Code>{`#delete = new Mutation<void, string>(this, {
  mutationFn: (id) =>
    fetch(\`/api/posts/\${id}\`, { method: 'DELETE' }),
  onSuccess: () => client.invalidateQueries(['posts']),
  client,
})

// In render():
html\`
  <button
    @click=\${() => this.#delete.mutate(this.post.id)}
    ?disabled=\${this.#delete.isPending}
    class="destructive"
  >
    \${this.#delete.isPending ? 'Deleting…' : 'Delete'}
  </button>
\``}</Code>
    </article>
  );
}
