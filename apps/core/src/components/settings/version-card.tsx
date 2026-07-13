import { Show } from "solid-js"
import { needRefresh, updateApp } from "@/shared/lib/pwa"

/**
 * App version card. When the service worker has a new build waiting (see
 * `shared/lib/pwa.ts`), an Update button applies it — the old card's
 * `/versioning.txt` check is replaced by the SW update signal.
 */
export default function VersionCard() {
  return (
    <a-card
      variant="glass"
      class="flex items-center justify-between gap-2 rounded-lg py-3.5 pl-5 pr-4"
    >
      <div>
        <div class="flex items-center gap-3">
          <a-icon name="refresh-cw" />
          <span class="text-xl font-medium">Aura</span>
        </div>
        <p class="mt-2 text-sm text-muted-foreground" data-testid="app-version">
          You are using version {__APP_VERSION__}
        </p>
      </div>
      <Show when={needRefresh()}>
        <a-button size="sm" data-testid="app-update" onClick={updateApp}>
          Update
        </a-button>
      </Show>
    </a-card>
  )
}
