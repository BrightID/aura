import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

export const appRoutes: RouteDefinition[] = [
  { path: '/', component: lazy(() => import('@/routes/index')) },
  { path: '*', component: lazy(() => import('@/routes/not-found')) },
];
