import type { ParentComponent } from 'solid-js';
import AppHeader from '@/components/shared/app-header';

const Layout: ParentComponent = (props) => {
  return (
    <div>
      <div
        class="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div class="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-20 dark:opacity-15 blur-3xl bg-primary" />
        <div class="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-15 dark:opacity-10 blur-3xl bg-accent" />
        <div class="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full opacity-10 dark:opacity-8 blur-3xl bg-primary" />
      </div>

      <div class="relative mx-auto w-full max-w-2xl">
        <AppHeader />
        {props.children}
      </div>
    </div>
  );
};

export default Layout;
