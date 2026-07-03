import { A, useLocation } from "@solidjs/router"
import { Show } from "solid-js"
import GlobalSearch from "@/components/search/global-search"
import NotificationBell from "@/components/shared/notification-bell"
import { authStore } from "@/store/auth"

/**
 * Persistent app header, ported from the old `DefaultHeader`: home link on the
 * left, global search / notifications bell / settings on the right. Rendered
 * from the root layout on every signed-in page except the landing flow
 * (`/`, `/login`, `/onboarding`) and home, which has its own richer header.
 */
export default function AppHeader() {
  const location = useLocation()

  const hidden = () => {
    const path = location.pathname
    return (
      path === "/" ||
      path.startsWith("/login") ||
      path.startsWith("/onboarding") ||
      path.startsWith("/home")
    )
  }

  return (
    <Show when={!hidden() && authStore.user?.brightId}>
      <header class="flex items-center justify-between px-5 pt-6">
        <A href="/home" data-testid="header-home">
          <a-button size="icon-sm" variant="glass" aria-label="Home">
            <a-icon name="house" />
          </a-button>
        </A>
        <div class="flex items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <A href="/settings" data-testid="header-settings">
            <a-button size="icon-sm" variant="glass" aria-label="Settings">
              <a-icon name="settings" />
            </a-button>
          </A>
        </div>
      </header>
    </Show>
  )
}
