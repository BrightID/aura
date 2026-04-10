import { toast } from '@aura/ui';
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdatePrompt = () => {
  const {
    offlineReady: [, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      r &&
        setInterval(() => {
          console.log('Checking for sw update');
          r.update();
        }, 60000);

      if (r && 'periodicSync' in r) {
        (r.periodicSync as any)?.register('periodic-task', {
          minInterval: 15 * 60 * 1000,
        });

        if (Notification.permission === 'default') {
          Notification.requestPermission().then(() =>
            console.log('user allowed notifications'),
          );
        }
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  React.useEffect(() => {
    if (needRefresh) {
      toast('New Version Available', {
        description: 'Click update to get the latest features.',
        action: {
          label: 'Update',
          onClick: () => {
            updateServiceWorker(true);
            setOfflineReady(false);
            setNeedRefresh(false);
          },
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, setNeedRefresh, setOfflineReady, updateServiceWorker]);

  return null;
};

export default UpdatePrompt;
