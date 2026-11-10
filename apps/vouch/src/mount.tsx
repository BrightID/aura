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
  // The code injectRemoteCss puts in remoteEntry.js adds these links when landing
  // first imports vouch. mount() enables them and the cleanup disables them, so
  // Tailwind's preflight stops restyling landing once the user leaves vouch.
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
