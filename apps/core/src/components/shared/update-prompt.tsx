import { toast } from "@aura/ui"
import { createEffect, onMount } from "solid-js"
import { initPwa, needRefresh, updateApp } from "@/shared/lib/pwa"

/**
 * Headless PWA updater (old `UpdatePrompt`): registers the service worker and
 * toasts "New version available" with an Update action when one is waiting.
 */
export default function UpdatePrompt() {
  onMount(initPwa)

  createEffect(() => {
    if (!needRefresh()) return
    toast.info("New version available", {
      id: "pwa-update",
      duration: Infinity,
      action: { label: "Update", onClick: updateApp },
    })
  })

  return null
}
