import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { NavLink, useLocation } from "react-router"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const { pathname } = useLocation()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4 p-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear rounded-md shadow-sm"
              asChild
            >
              <NavLink to="/dashboard/projects/new">
                <IconCirclePlusFilled className="h-5 w-5" />
                <span className="font-medium">Quick Create</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="border-t pt-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  className={
                    pathname === item.url
                      ? "bg-secondary text-secondary-foreground"
                      : ""
                  }
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
