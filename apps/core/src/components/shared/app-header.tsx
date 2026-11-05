import { A, useLocation } from '@solidjs/router';
import { Show } from 'solid-js';
import GlobalSearch from '@/components/search/global-search';
import NotificationBell from '@/components/shared/notification-bell';
import { toRouterPath } from '@/shared/lib/urls';
import { authStore } from '@/store/auth';
import Icon from '@/components/ui/icon';

/**
 * Persistent app header, ported from the old `DefaultHeader`: home link on the
 * left, global search / notifications bell / settings on the right. Rendered
 * from the root layout on every signed-in page except the landing flow
 * (`/`, `/login`, `/onboarding`) and home, which has its own richer header.
 */
export default function AppHeader() {
  const location = useLocation();
  // `pathname` includes the router base (`/core/...`) — strip it so the
  // route checks below compare app paths.
  const path = () => toRouterPath(location.pathname);

  const hidden = () => {
    const p = path();
    return (
      p === '/' ||
      p.startsWith('/login') ||
      p.startsWith('/onboarding') ||
      p.startsWith('/home')
    );
  };

  // Derive a page heading from the route so subpages regain the old header
  // title (the old `DefaultHeader` always showed one).
  const title = () => {
    const p = path();
    if (p.startsWith('/subject')) return 'Profile';
    if (p.startsWith('/settings')) return 'Settings';
    if (p.startsWith('/notifications')) return 'Notifications';
    if (p.startsWith('/role-management')) return 'Roles';
    if (p.startsWith('/contact-info')) return 'Contact info';
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/domain-overview')) return 'Domain';
    return '';
  };

  return (
    <Show when={!hidden() && authStore.user?.brightId}>
      <header class="flex items-center justify-between gap-2 px-5 pt-6">
        <div class="flex min-w-0 items-center gap-2">
          <A href="/home" data-testid="header-home" class="shrink-0">
            <button
              class="a-button"
              type="button"
              data-size="icon"
              data-variant="glass"
              aria-label="Home"
            >
              <Icon name="house" />
            </button>
          </A>
          <Show when={title()}>
            <h2
              class="a-head min-w-0 truncate text-lg"
              data-testid="header-title"
            >
              {title()}
            </h2>
          </Show>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <A href="/settings" data-testid="header-settings">
            <button
              class="a-button"
              type="button"
              data-size="icon"
              data-variant="glass"
              aria-label="Settings"
            >
              <Icon name="settings" />
            </button>
          </A>
        </div>
      </header>
    </Show>
  );
}
