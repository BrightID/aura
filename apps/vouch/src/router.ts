import type { RouteDefinition } from '@solidjs/router';
import Answer, { PastAnswer } from '@/routes/answer';
import Home from '@/routes/index';
import NotFound from '@/routes/not-found';
import Partner from '@/routes/partner';
import Requests from '@/routes/requests';

export const appRoutes: RouteDefinition[] = [
  { path: '/', component: Home },
  { path: '/requests', component: Requests },
  { path: '/answer/:subject/:role?', component: Answer },
  { path: '/past/:subject/:role?', component: PastAnswer },
  { path: '/partner', component: Partner },
  { path: '*', component: NotFound },
];
