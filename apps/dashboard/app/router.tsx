import { createBrowserRouter } from 'react-router';
import Root, { ErrorBoundary } from './root';
import PanelLayout from './routes/_panel/route';
import PanelIndex from './routes/_panel._index/route';
import Account from './routes/_panel.account._index/route';
import Analytics from './routes/_panel.analytics._index/route';
import Billing from './routes/_panel.billing._index/route';
import Notifications from './routes/_panel.notifications._index/route';
import Pricing from './routes/_panel.pricing/route';
import ProjectsIndex from './routes/_panel.projects._index/route';
import ProjectsNew from './routes/_panel.projects.new/route';
import ProjectDetail from './routes/_panel.projects.$id._index/route';
import ProjectUpgrade from './routes/_panel.projects.$id.upgrade/route';
import LoginLayout from './routes/login/route';
import LoginIndex from './routes/login._index/route';
import LoginBrightId from './routes/login.brightid/route';
import Onboarding from './routes/onboarding/route';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Root,
      errorElement: <ErrorBoundary />,
      children: [
        {
          Component: PanelLayout,
          children: [
            { index: true, Component: PanelIndex },
            { path: 'account', Component: Account },
            { path: 'analytics', Component: Analytics },
            { path: 'billing', Component: Billing },
            { path: 'notifications', Component: Notifications },
            { path: 'pricing', Component: Pricing },
            { path: 'projects', Component: ProjectsIndex },
            { path: 'projects/new', Component: ProjectsNew },
            { path: 'projects/:id', Component: ProjectDetail },
            { path: 'projects/:id/upgrade', Component: ProjectUpgrade },
          ],
        },
        {
          path: 'login',
          Component: LoginLayout,
          children: [
            { index: true, Component: LoginIndex },
            { path: 'brightid', Component: LoginBrightId },
          ],
        },
        { path: 'onboarding', Component: Onboarding },
      ],
    },
  ],
  { basename: '/dashboard' },
);
