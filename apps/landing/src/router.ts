import { createSignal } from 'solid-js';
import { remotes } from './remotes';

export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

const [path, setPath] = createSignal(normalizePath(window.location.pathname));
export { path };

function remoteFor(pathname: string) {
  return remotes.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );
}

/** Same-origin app paths. `/docs` is a different Vercel service — leave it alone. */
function isClientPath(pathname: string) {
  if (pathname === '/docs' || pathname.startsWith('/docs/')) return false;
  return true;
}

export function navigate(to: string, replace = false) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin || !isClientPath(url.pathname)) {
    window.location.assign(url.href);
    return;
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  const curr = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const nextPath = normalizePath(url.pathname);
  const prevRemote = remoteFor(path());

  if (next !== curr) {
    if (replace) history.replaceState(history.state, '', next);
    else history.pushState(history.state, '', next);
  }

  setPath(nextPath);

  // Inner routers (React / Solid / Lit) listen to popstate, not pushState.
  // Only ping them when the same remote stays mounted.
  if (next !== curr && prevRemote && prevRemote === remoteFor(nextPath)) {
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

function interceptLink(e: MouseEvent) {
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  ) {
    return;
  }
  const anchor = e
    .composedPath()
    .find(
      (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement,
    );
  if (!anchor) return;
  if (anchor.target && anchor.target !== '_self') return;
  if (anchor.hasAttribute('download')) return;
  if (anchor.getAttribute('rel') === 'external') return;

  const href = anchor.getAttribute('href');
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return;
  }

  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return;
  }
  if (url.origin !== window.location.origin || !isClientPath(url.pathname))
    return;

  e.preventDefault();
  navigate(`${url.pathname}${url.search}${url.hash}`);
}

export function startClientNav() {
  window.addEventListener('popstate', () => {
    setPath(normalizePath(window.location.pathname));
  });
  document.addEventListener('click', interceptLink, true);
}
