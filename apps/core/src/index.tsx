/* @refresh reload */

import "@/index.css"
import "@aura/ui"
import { Router } from "@solidjs/router"
import { render } from "solid-js/web"
import Providers from "@/providers"
import { appRoutes } from "@/router"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element #root not found")
}

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined

render(
  () => (
    <Providers>
      <Router base={routerBase}>{appRoutes}</Router>
    </Providers>
  ),
  root,
)
