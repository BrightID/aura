import { cleanupOutdatedCaches } from 'workbox-precaching';
import { setupPwa } from '@vite-pwa/remix/sw';
import { setupRoutes } from './shared-sw';
import { triggerNotificationFetch } from './store/notifications';
import { configureAppStore } from './store';

declare const self: ServiceWorkerGlobalScope;
cleanupOutdatedCaches();

setupPwa({
  manifest: self.__WB_MANIFEST,
});

setupRoutes().then(console.log);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'periodic-task') {
    const { store } = configureAppStore();

    const state = store.getState();

    event.waitUntil(
      (async () => {
        if (!state.profile.authData?.brightId) return;

        const subjectId = state.profile.authData.brightId;

        await triggerNotificationFetch(
          store.getState,
          store.dispatch,
          subjectId,
        );

        const { alerts } = store.getState();

        if (Notification.permission !== 'granted') {
          return;
        }

        const newNotifications = alerts.alerts.filter((item) => !item.viewed);

        if (!newNotifications.length) return;

        await self.registration.showNotification('New Notifications', {
          body: 'You have new notifications in aura app!',
          icon: '/assets/images/notification.jpg',
          tag: 'update-notification',
        });
      })(),
    );
  }
});
