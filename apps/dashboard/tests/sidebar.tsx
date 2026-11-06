// The mobile sidebar is a modal <dialog> (a sheet). Its user menu must open
// on top of it, not behind it: content outside an open modal dialog is inert
// and drawn under the top layer. scripts/visual-check.mjs runs this at phone
// width.
import '../app/app.css';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import type { User } from 'firebase/auth';
import {
  Sidebar,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from '../app/components/ui/sidebar';
import { NavUser } from '../app/components/nav-user';

const user = {
  displayName: 'Aura User',
  email: 'user@example.com',
  photoURL: null,
} as unknown as User;

createRoot(document.getElementById('root')!).render(
  <MemoryRouter>
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <main className="p-4">
        <SidebarTrigger id="open-sidebar" />
        <p id="result">Checking…</p>
      </main>
    </SidebarProvider>
  </MemoryRouter>,
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function check() {
  await wait(300);
  document.getElementById('open-sidebar')!.click();
  await wait(300);
  const trigger = document.querySelector<HTMLElement>(
    'dialog[open] [data-slot="dropdown-menu-trigger"]',
  );
  if (!trigger) return 'FAIL: the mobile sidebar did not open';
  trigger.focus();
  trigger.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
  );
  await wait(300);
  const menu = document.querySelector<HTMLElement>(
    '[data-slot="dropdown-menu-content"]',
  );
  if (!menu) return 'FAIL: the user menu did not open';
  const r = menu.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return hit && menu.contains(hit)
    ? 'PASS: user menu opens above the mobile sidebar'
    : `FAIL: user menu is hidden under the sidebar (${hit?.tagName ?? 'nothing'} on top)`;
}
check().then((r) => (document.getElementById('result')!.textContent = r));
