import { createSignal, onCleanup, onMount, Show } from "solid-js"
import type { MountModule } from "./remotes"

export default function RemoteApp(props: { load: () => Promise<MountModule> }) {
  let el: HTMLDivElement | undefined
  const [error, setError] = createSignal<string | null>(null)

  onMount(() => {
    let cancelled = false
    let unmount: (() => void) | void

    props
      .load()
      .then((mod) => {
        if (cancelled || !el) return
        unmount = mod.mount(el)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load application")
      })

    onCleanup(() => {
      cancelled = true
      unmount?.()
    })
  })

  return (
    <Show
      when={!error()}
      fallback={
        <main style={errorMainStyle}>
          <div>
            <h1 style={errorTitleStyle}>Could not load this app</h1>
            <p style={errorDetailStyle}>{error()}</p>
          </div>
        </main>
      }
    >
      <div ref={el} style={{ "min-height": "100vh" }} />
    </Show>
  )
}

const errorMainStyle = {
  "min-height": "100vh",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  padding: "2rem",
  "text-align": "center",
  "font-family": "system-ui, sans-serif",
} as const

const errorTitleStyle = {
  "font-size": "1.5rem",
  "font-weight": "600",
  "margin-bottom": "0.5rem",
} as const

const errorDetailStyle = {
  "font-size": "0.875rem",
  opacity: "0.7",
} as const
