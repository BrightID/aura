// Register all `a-*` custom elements from @aura/ui. Imported here (the
// client-only entry) so `customElements.define` never runs during the
// build-time prerender of the SPA shell.
import "@aura/ui"

import { StrictMode, startTransition } from "react"
import { hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  )
})
