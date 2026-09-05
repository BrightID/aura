import { Router } from '@lit-labs/router';
import { signal } from '@lit-labs/signals';

import 'urlpattern-polyfill';

// The app is deployed in production under the `/interface` path prefix (see
// vite.config.ts `base`). `@lit-labs/router` has no basename concept — it
// matches full absolute pathnames — so every route in `app-routes.ts` is
// registered with this prefix baked in. The rest of the app keeps reasoning
// in app-relative paths ('/home', '/login', ...); `toAppPath`/`stripBase`
// are the only two places that know about the prefix.
const BASE_PATH = '/interface';

export const toAppPath = (path: string) =>
  path === '/' ? `${BASE_PATH}/login` : `${BASE_PATH}${path}`;

export const stripBase = (pathname: string) => {
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) return '/login';
  if (pathname.startsWith(`${BASE_PATH}/`))
    return pathname.slice(BASE_PATH.length);
  return pathname;
};

export const router = signal(null as null | Router);

const initialPath = stripBase(window.location.pathname);
if (
  initialPath === '/login' &&
  !window.location.pathname.startsWith(`${BASE_PATH}/login`)
) {
  history.replaceState('', '', toAppPath('/login'));
}
export const currentPath = signal(initialPath);

export const pushRouter = (path: string) => {
  const fullPath = toAppPath(path);
  history.pushState('', '', fullPath);
  router.get()?.goto(fullPath);
  currentPath.set(path);
};

export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}
