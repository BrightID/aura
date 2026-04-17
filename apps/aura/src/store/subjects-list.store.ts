import { create } from 'zustand';
import type { AuraNodeBrightIdConnectionWithBackupData } from 'types';

interface SubjectsListState {
  items: AuraNodeBrightIdConnectionWithBackupData[] | null;
  itemsFiltered: AuraNodeBrightIdConnectionWithBackupData[] | null;
  loading: boolean;
  setItems: (items: AuraNodeBrightIdConnectionWithBackupData[] | null) => void;
  setItemsFiltered: (items: AuraNodeBrightIdConnectionWithBackupData[] | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubjectsListStore = create<SubjectsListState>()((set) => ({
  items: null,
  itemsFiltered: null,
  loading: false,
  setItems: (items) => set({ items }),
  setItemsFiltered: (itemsFiltered) => set({ itemsFiltered }),
  setLoading: (loading) => set({ loading }),
}));
