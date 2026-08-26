import { type RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

// The marketing pages live in apps/landing now. With basename `/dashboard`,
// `_landing._index` would occupy `/dashboard` and hide the panel.
export default flatRoutes({
  ignoredRouteFiles: ['**/_landing*/**'],
}) satisfies RouteConfig;
