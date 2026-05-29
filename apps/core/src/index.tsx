/* @refresh reload */

import "@/index.css"
import "@aura/ui"
import { Router } from "@solidjs/router"
import { render } from "solid-js/web"
import { appRoutes } from "@/router"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element #root not found")
}

render(() => <Router>{appRoutes}</Router>, root)
