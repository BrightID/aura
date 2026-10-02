import type { ParentComponent } from 'solid-js';
import AppHeader from '@/components/shared/app-header';

const Layout: ParentComponent = (props) => (
  <div class="min-h-dvh bg-background">
    <div class="relative mx-auto w-full max-w-2xl">
      <AppHeader />
      <main>{props.children}</main>
    </div>
  </div>
);

export default Layout;
