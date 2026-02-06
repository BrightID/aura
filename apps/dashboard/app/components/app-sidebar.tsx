import * as React from "react"

import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "~/lib/firebase"
import { Link } from "react-router"
import { dashboardLinks } from "~/constants/dashboard-links"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user] = useAuthState(auth)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img src="/favicon.ico" width={30} height={30} alt="aura" />
                <span className="text-base font-semibold">Aura Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dashboardLinks.navMain} />
        <NavSecondary items={dashboardLinks.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
