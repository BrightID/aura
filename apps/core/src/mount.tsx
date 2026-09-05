import '@/index.css';
import '@aura/ui';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import Providers from '@/providers';
import { appRoutes } from '@/router';

const ROOT_CLASS = ['max-w-md', 'mx-auto', 'mt-10'] as const;
const BODY_CLASS = [
  'h-screen',
  'overflow-y-auto',
  'overflow-x-hidden',
  'bg-background',
  'text-foreground',
] as const;

export function mount(el: HTMLElement) {
  el.classList.add(...ROOT_CLASS);
  document.documentElement.classList.add('dark');
  document.body.classList.add(...BODY_CLASS);
  const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
  const dispose = render(
    () => (
      <Providers>
        <Router base={routerBase}>{appRoutes}</Router>
      </Providers>
    ),
    el,
  );
  return () => {
    dispose();
    el.classList.remove(...ROOT_CLASS);
    document.body.classList.remove(...BODY_CLASS);
  };
}
