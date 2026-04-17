import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications.store';
import { useProfileStore } from '@/store/profile.store';

const CHECK_INTERVAL = 2.5 * 60 * 1000; // 2.5 minutes
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function NotificationsChecker() {
  const authData = useProfileStore((s) => s.authData);
  const lastFetch = useNotificationsStore((s) => s.lastFetch);
  const resetOnMountStates = useNotificationsStore((s) => s.resetOnMountStates);
  const triggerNotificationFetch = useNotificationsStore((s) => s.triggerNotificationFetch);

  useEffect(() => {
    resetOnMountStates();
  }, []);

  useEffect(() => {
    if (!authData?.brightId) return;

    if (lastFetch && Date.now() - lastFetch < CHECK_INTERVAL) return;

    const fetchNotifications = async () => {
      try {
        await triggerNotificationFetch(authData.brightId);
      } catch (error) {
        console.error('Notification fetch failed:', error);
      }
    };

    fetchNotifications();

    const interval = setInterval(() => {
      triggerNotificationFetch(authData.brightId);
    }, FETCH_INTERVAL);

    return () => clearInterval(interval);
  }, [authData?.brightId, lastFetch]);

  return null;
}
