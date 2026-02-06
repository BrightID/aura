import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

export default function useCallbackOnRouteChange(
  callback?: (...args: any[]) => any,
) {
  const location = useLocation();
  const [prevLocation, setPrevLocation] = useState<null | string>(null);
  useEffect(() => {
    if (prevLocation !== location.pathname) {
      if (prevLocation) {
        callback?.();
      }
      setPrevLocation(location.pathname);
    }
  }, [callback, location.pathname, prevLocation]);
}
