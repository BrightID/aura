'use client';

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <a-dropdown-menu
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'end' : 'start'}
            >
              <SidebarMenuAction
                slot="trigger"
                showOnHover
                className="data-[state=open]:bg-accent rounded-sm"
              >
                <IconDots />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
              <div slot="content" className="w-24 rounded-lg">
                <a-dropdown-item>
                  <IconFolder />
                  <span>Open</span>
                </a-dropdown-item>
                <a-dropdown-item>
                  <IconShare3 />
                  <span>Share</span>
                </a-dropdown-item>
                <a-dropdown-separator />
                <a-dropdown-item variant="destructive">
                  <IconTrash />
                  <span>Delete</span>
                </a-dropdown-item>
              </div>
            </a-dropdown-menu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
