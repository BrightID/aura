import { useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import {
  alertsLastFetchSelector,
  resetOnMountStates,
  triggerNotificationFetch,
} from '@/store/notifications';
import { selectAuthData } from '@/store/profile/selectors';

const CHECK_INTERVAL = 2.5 * 60 * 1000; // 2.5 minutes
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function NotificationsChecker() {
  const dispatch = useDispatch();
  const { getState } = useStore();
  const authData = useSelector(selectAuthData);
  const lastFetch = useSelector(alertsLastFetchSelector);

  useEffect(() => {
    dispatch(resetOnMountStates());
  }, []);

  useEffect(() => {
    if (!authData?.brightId) return;

    if (lastFetch && Date.now() - lastFetch < CHECK_INTERVAL) return;

    const fetchNotifications = async () => {
      try {
        await triggerNotificationFetch(getState, dispatch, authData.brightId);
      } catch (error) {
        console.error('Notification fetch failed:', error);
      }
    };

    fetchNotifications();

    const interval = setInterval(() => {
      triggerNotificationFetch(getState, dispatch, authData?.brightId);
    }, FETCH_INTERVAL);

    return () => clearInterval(interval);
  }, [dispatch, getState, authData?.brightId, lastFetch]);

  return null;
}
