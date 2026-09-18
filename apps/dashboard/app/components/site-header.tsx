import { BookOpen, LogOutIcon, Moon, Sun } from 'lucide-react';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { useTheme } from '~/components/theme-provider';
import { logUserOut } from '~/lib/auth-actions';
import { useNavigate, useLocation, Link } from 'react-router';
import { IconBrandGithub } from '@tabler/icons-react';
import { useMemo, type CSSProperties } from 'react';
import { dashboardLinks } from '~/constants/dashboard-links';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

const mutedIconButton = {
  '--color': 'var(--muted-foreground)',
} as CSSProperties;

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const activeLink = useMemo(() => {
    const links = [
      ...dashboardLinks.navMain,
      ...dashboardLinks.navAccount,
      ...dashboardLinks.navSecondary,
    ];
    return links
      .filter((item) => {
        if (!item.url || item.url.startsWith('http') || item.url === '#') {
          return false;
        }
        if (item.url === '/') return location.pathname === '/';
        return (
          location.pathname === item.url ||
          location.pathname.startsWith(`${item.url}/`)
        );
      })
      .sort((a, b) => b.url.length - a.url.length)[0];
  }, [location.pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" style={mutedIconButton} />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {activeLink?.title || 'Dashboard'}
        </h1>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              to="https://brightid.gitbook.io/aura/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Documentation"
            >
              <BookOpen />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              to="https://github.com/BrightID/aura-verified"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <IconBrandGithub className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => {
              logUserOut();
              navigate('/login');
            }}
          >
            <LogOutIcon />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
