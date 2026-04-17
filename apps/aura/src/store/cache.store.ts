import { create } from 'zustand';

interface CacheState {
  fetchedSubjectsFromProfile: Record<string, number>;
}

interface CacheActions {
  setSubjectCache: (id: string) => void;
  setBulkSubjectsCache: (subjects: Record<string, number>) => void;
  reset: () => void;
}

const initialState: CacheState = {
  fetchedSubjectsFromProfile: {},
};

export const useCacheStore = create<CacheState & CacheActions>()((set) => ({
  ...initialState,
  setSubjectCache: (id) =>
    set((s) => ({
      fetchedSubjectsFromProfile: { ...s.fetchedSubjectsFromProfile, [id]: Date.now() },
    })),
  setBulkSubjectsCache: (subjects) =>
    set((s) => ({
      fetchedSubjectsFromProfile: { ...s.fetchedSubjectsFromProfile, ...subjects },
    })),
  reset: () => set(initialState),
}));
