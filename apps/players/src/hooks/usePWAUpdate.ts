import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

const CHECK_INTERVAL = 1000 * 3 * 1; // 1 minute

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
    });

    const interval = setInterval(() => {
      console.log('[] Checking for update');
      navigator.serviceWorker.ready
        .then((registration) => {
          // registration.update();
        })
        .catch((error) => {
          console.error('Error during service worker update check:', error);
        });

      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setUpdateAvailable(true);
        }
      });
    }, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return updateAvailable;
}
