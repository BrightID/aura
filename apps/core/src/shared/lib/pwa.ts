import { createSignal } from "solid-js"

// One-hour poll keeps long-lived tabs finding new deploys (old app's SW
// update cadence). The worker itself is emitted at build time by
// `sw-plugin.ts`; it precaches the bundle and waits for SKIP_WAITING.
const UPDATE_INTERVAL = 60 * 60 * 1000

const [needRefresh, setNeedRefresh] = createSignal(false)
let registration: ServiceWorkerRegistration | undefined
let reloading = false

/** True once a new service-worker build is waiting to activate. */
export { needRefresh }

/** Activate the waiting service worker; the controller change reloads us. */
export function updateApp() {
  registration?.waiting?.postMessage("SKIP_WAITING")
}

/** Register the service worker (production only; safe to call once). */
export function initPwa() {
  if (!import.meta.env.PROD) return
  if (registration || !("serviceWorker" in navigator)) return

  // A new worker took over (after updateApp) — load the new bundle.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })

  navigator.serviceWorker.register("/sw.js").then((reg) => {
    registration = reg

    // "installed" while a controller exists = an update is waiting
    // (first-ever install has no controller and needs no prompt).
    const watch = (worker: ServiceWorker | null) =>
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller)
          setNeedRefresh(true)
      })

    if (reg.waiting && navigator.serviceWorker.controller) setNeedRefresh(true)
    watch(reg.installing)
    reg.addEventListener("updatefound", () => watch(reg.installing))

    setInterval(() => reg.update(), UPDATE_INTERVAL)
  })
}
