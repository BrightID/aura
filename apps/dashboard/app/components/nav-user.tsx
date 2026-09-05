import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react';
import type { User } from 'firebase/auth';
import { useNavigate, Link } from 'react-router';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { logUserOut } from '~/lib/auth-actions';

export function NavUser({ user }: { user: User | null | undefined }) {
  const { isMobile } = useSidebar();

  const navigate = useNavigate();

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <a-dropdown-menu
          side={isMobile ? 'bottom' : 'right'}
          align="end"
          sideOffset={4}
        >
          <SidebarMenuButton
            slot="trigger"
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <a-avatar
              className="h-8 w-8 rounded-lg grayscale"
              src={user.photoURL ?? ''}
              alt={user.displayName ?? user.email!}
              fallback="CN"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.displayName ?? user.email}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <IconDotsVertical className="ml-auto size-4" />
          </SidebarMenuButton>
          <div slot="content" className="min-w-56 rounded-lg">
            <a-dropdown-label className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <a-avatar
                  className="h-8 w-8 rounded-lg"
                  src={user.photoURL || ''}
                  alt={user.displayName || user.email!}
                  fallback="CN"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.displayName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </a-dropdown-label>
            <a-dropdown-separator />
            <Link to="/account">
              <a-dropdown-item>
                <IconUserCircle />
                Account
              </a-dropdown-item>
            </Link>
            <Link to="/billing">
              <a-dropdown-item>
                <IconCreditCard />
                Billing
              </a-dropdown-item>
            </Link>
            <Link to="/notifications">
              <a-dropdown-item>
                <IconNotification />
                Notifications
              </a-dropdown-item>
            </Link>
            <a-dropdown-separator />
            <a-dropdown-item
              onClick={() => {
                logUserOut();
                navigate('/');
              }}
            >
              <IconLogout />
              Log out
            </a-dropdown-item>
          </div>
        </a-dropdown-menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
