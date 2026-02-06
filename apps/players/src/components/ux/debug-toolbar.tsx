import { IS_PRODUCTION } from '@/utils/env';
import localforage from 'localforage';
import { useEffect } from 'react';

declare global {
  interface Window {
    __auraDebug?: {
      localforage: typeof localforage;
    };
  }
}

export default function DebugToolbar() {
  useEffect(() => {
    if (IS_PRODUCTION) return;

    window.__auraDebug = {
      localforage: localforage,
    };
  }, []);
  return null;
}
