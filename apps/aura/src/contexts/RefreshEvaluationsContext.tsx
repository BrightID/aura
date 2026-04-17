// Re-exports from zustand store — kept for backwards compatibility
export { useRefreshStore as useRefreshEvaluationsContext } from '@/store/refresh.store';

import type { ReactNode } from 'react';

// Provider is now a no-op wrapper; state lives in useRefreshStore
export function RefreshEvaluationsContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
