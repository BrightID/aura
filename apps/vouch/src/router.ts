import type { RouteDefinition } from '@solidjs/router';
import { LIVE, livePaths } from '@/live/config';
import Answer, { PastAnswer } from '@/routes/answer';
import Home from '@/routes/index';
import LiveEvidence from '@/routes/live-evidence';
import NotFound from '@/routes/not-found';
import Partner from '@/routes/partner';
import Requests from '@/routes/requests';

export const appRoutes: RouteDefinition[] = [
  { path: '/', component: Home },
  { path: '/requests', component: Requests },
  { path: '/answer/:subject/:role?', component: Answer },
  { path: '/past/:subject/:role?', component: PastAnswer },
  { path: '/partner', component: Partner },
  ...livePaths(LIVE).map((path) => ({ path, component: LiveEvidence })),
  { path: '*', component: NotFound },
];
