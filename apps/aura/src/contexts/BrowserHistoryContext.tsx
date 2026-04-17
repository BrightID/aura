import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useBrowserHistoryStore } from '@/store/browser-history.store';

export { useBrowserHistoryStore as useBrowserHistoryContext } from '@/store/browser-history.store';

export function BrowserHistoryContextProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const setFirstPagePath = useBrowserHistoryStore((s) => s.setFirstPagePath);

  useEffect(() => {
    setFirstPagePath(location.pathname);
  }, [location.pathname, setFirstPagePath]);

  return <>{children}</>;
}
