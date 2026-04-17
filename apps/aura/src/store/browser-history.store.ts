import { create } from 'zustand';

interface BrowserHistoryState {
  firstPagePath: string | null;
  isFirstVisitedRoute: boolean;
  setFirstPagePath: (path: string) => void;
}

export const useBrowserHistoryStore = create<BrowserHistoryState>()((set) => ({
  firstPagePath: null,
  isFirstVisitedRoute: true,
  setFirstPagePath: (path) =>
    set((s) => {
      const firstPagePath = s.firstPagePath ?? path;
      return {
        firstPagePath,
        isFirstVisitedRoute: path === firstPagePath,
      };
    }),
}));
