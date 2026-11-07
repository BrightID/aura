import '@/index.css';
import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { appRoutes } from '@/router';

const BODY_CLASS = [
  'min-h-screen',
  'bg-background',
  'text-foreground',
] as const;

export function mount(el: HTMLElement) {
  document.documentElement.classList.add('dark');
  document.body.classList.add(...BODY_CLASS);
  const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
  const dispose = render(
    () => <Router base={routerBase}>{appRoutes}</Router>,
    el,
  );
  return () => {
    dispose();
    document.body.classList.remove(...BODY_CLASS);
  };
}
