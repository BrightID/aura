import { create } from 'zustand';

interface RefreshState {
  refreshCounter: number;
  refreshEvaluations: () => void;
}

export const useRefreshStore = create<RefreshState>()((set) => ({
  refreshCounter: 0,
  refreshEvaluations: () => set((s) => ({ refreshCounter: s.refreshCounter + 1 })),
}));
