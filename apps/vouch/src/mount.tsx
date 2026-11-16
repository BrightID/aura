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
  const html = document.documentElement;
  const addedDark = !html.classList.contains('dark');
  html.classList.add('dark');
  document.body.classList.add(...BODY_CLASS);
  // The vite.config injectRemoteCss plugin adds these links disabled. Our CSS
  // includes Tailwind's preflight reset, which would restyle the landing host
  // page, so it applies only between mount() and the cleanup returned below.
  const css = document.querySelectorAll<HTMLLinkElement>(
    `link[data-remote-css="${import.meta.env.BASE_URL}"]`,
  );
  for (const link of css) link.disabled = false;
  const routerBase = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
  const dispose = render(
    () => <Router base={routerBase}>{appRoutes}</Router>,
    el,
  );
  return () => {
    dispose();
    document.body.classList.remove(...BODY_CLASS);
    if (addedDark) html.classList.remove('dark');
    for (const link of css) link.disabled = true;
  };
}
