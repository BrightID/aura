// Pages that render without a Firebase session, plus an open dropdown, for
// the screenshot check (scripts/visual-check.mjs). The check builds this with
// fake Firebase settings; nothing signs in.
import '../app/app.css';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../app/routes/login._index/route';
import Pricing from '../app/routes/_panel.pricing/route';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../app/components/ui/dropdown-menu';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>
      <div className="min-h-screen bg-background p-6 text-foreground">
        <Login />
        <div className="my-6 h-48">
          <DropdownMenu open modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className="a-button" data-variant="outline">
                Menu
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Pricing />
        <p id="result">READY</p>
      </div>
    </MemoryRouter>
  </QueryClientProvider>,
);
