import { Book, LogOutIcon, Moon, Sun } from "lucide-react"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { useTheme } from "~/components/theme-provider"
import { logUserOut } from "~/lib/auth-actions"
import { useNavigate, useLocation, Link } from "react-router"
import { IconBrandGithub } from "@tabler/icons-react"
import { useMemo } from "react"
import { dashboardLinks } from "~/constants/dashboard-links"

export function SiteHeader() {
  const { theme, setTheme } = useTheme()

  const navigate = useNavigate()
  const location = useLocation()

  const activeLink = useMemo(
    () =>
      dashboardLinks.navMain
        .concat(dashboardLinks.navSecondary)
        .find((item) => item.url === location.pathname),
    [location]
  )

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <a-separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {activeLink?.title || "Dashboard"}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Link to={"http://brightid.gitbook.io/aura/"} target="_blank">
            <a-button variant="ghost" size="icon-sm">
              <Book size={40} />
            </a-button>
          </Link>
          <Link
            to={"https://github.com/BrightID/aura-verified"}
            target="_blank"
          >
            <a-button variant="ghost" size="icon-sm">
              <IconBrandGithub size={40} />
            </a-button>
          </Link>
          <a-button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </a-button>
          <a-button
            variant="outline"
            size="sm"
            className="hidden sm:flex dark:text-foreground"
            onClick={() => {
              logUserOut()
              navigate("/")
            }}
          >
            <LogOutIcon />
            Logout
          </a-button>
        </div>
      </div>
    </header>
  )
}
