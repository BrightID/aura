import { Outlet } from 'react-router';
import EvaluationOpNotifications from '@/components/EvaluationOpNotifications';
import { IS_PRODUCTION } from '@/utils/env';
import NotificationsChecker from '@/components/notifications/notifications-checker';

export default function AppLanding() {
  return (
    <div className="bg-background-light dark:bg-background">
      <div
        className={`${IS_PRODUCTION ? 'bg-circle-dots' : 'bg-lines'} relative`}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

        <div className="app relative">
          <Outlet />

          <div className="sticky bottom-2 pl-5 pr-5">
            <EvaluationOpNotifications />
          </div>
        </div>
      </div>
      <NotificationsChecker />
    </div>
  );
}
