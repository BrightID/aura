import { A } from '@solidjs/router';
import { Show } from 'solid-js';
import { unreadCount } from '@/store/notifications';

/** Bell link to `/notifications` with the unread-count badge. */
export default function NotificationBell() {
  return (
    <A href="/notifications" class="relative" data-testid="notifications-bell">
      <a-button size="icon-sm" variant="glass" aria-label="Notifications">
        <a-icon name="bell" />
      </a-button>
      <Show when={unreadCount() > 0}>
        <span class="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {unreadCount()}
        </span>
      </Show>
    </A>
  );
}
