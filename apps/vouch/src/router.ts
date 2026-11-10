import type { RouteDefinition } from '@solidjs/router';
import Home from '@/routes/index';
import NotFound from '@/routes/not-found';

export const appRoutes: RouteDefinition[] = [
  { path: '/', component: Home },
  { path: '*', component: NotFound },
];
