import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { AURA_NODE_URL_PROXY } from '@/constants/urls';
import { __DEV__ } from '@/utils/env';

export enum RoleStatus {
  NOT_SET,
  HIDE,
  SHOW,
}

export interface SettingsState {
  baseUrl: string | null;
  nodeUrls: string[];
  isPrimaryDevice: boolean;
  lastSyncTime: number;
  languageTag: string | null;
  prefferedTheme: 'dark' | 'light';
  isSearchModalOpen: boolean;
  hasManagerRole: RoleStatus;
  hasTrainerRole: RoleStatus;
}

interface SettingsActions {
  toggleManagerRole: () => void;
  toggleTrainerRole: () => void;
  setBaseUrl: (url: string) => void;
  clearBaseUrl: () => void;
  setPrefferedTheme: (theme: 'dark' | 'light') => void;
  addNodeUrl: (url: string) => void;
  removeNodeUrl: (url: string) => void;
  removeCurrentNodeUrl: () => void;
  resetNodeUrls: () => void;
  setPrimaryDevice: (value: boolean) => void;
  setLastSyncTime: (time: number) => void;
  setLanguageTag: (tag: string) => void;
  resetLanguageTag: () => void;
  toggleSearchModal: () => void;
  reset: () => void;
}

const ProdCandidates = [AURA_NODE_URL_PROXY];
const TestCandidates = [AURA_NODE_URL_PROXY];

const initialState: SettingsState = {
  baseUrl: AURA_NODE_URL_PROXY,
  nodeUrls: __DEV__ ? TestCandidates : ProdCandidates,
  isPrimaryDevice: true,
  lastSyncTime: 0,
  languageTag: null,
  prefferedTheme: 'dark',
  isSearchModalOpen: false,
  hasManagerRole: RoleStatus.NOT_SET,
  hasTrainerRole: RoleStatus.NOT_SET,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      toggleManagerRole: () =>
        set((s) => ({
          hasManagerRole:
            s.hasManagerRole === RoleStatus.HIDE
              ? RoleStatus.SHOW
              : RoleStatus.HIDE,
        })),
      toggleTrainerRole: () =>
        set((s) => ({
          hasTrainerRole:
            s.hasTrainerRole === RoleStatus.HIDE
              ? RoleStatus.SHOW
              : RoleStatus.HIDE,
        })),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      clearBaseUrl: () => set({ baseUrl: null }),
      setPrefferedTheme: (prefferedTheme) => set({ prefferedTheme }),
      addNodeUrl: (url) => {
        const newUrl = url.toLowerCase();
        set((s) =>
          s.nodeUrls.includes(newUrl) ? s : { nodeUrls: [...s.nodeUrls, url] },
        );
      },
      removeNodeUrl: (url) => {
        const removeUrl = url.toLowerCase();
        set((s) => ({
          nodeUrls: s.nodeUrls.filter((u) => u.toLowerCase() !== removeUrl),
          baseUrl: s.baseUrl?.toLowerCase() === removeUrl ? null : s.baseUrl,
        }));
      },
      removeCurrentNodeUrl: () => {
        const { baseUrl } = get();
        if (baseUrl) {
          set((s) => ({
            nodeUrls: s.nodeUrls.filter((u) => u.toLowerCase() !== baseUrl),
            baseUrl: null,
          }));
        }
      },
      resetNodeUrls: () =>
        set((s) => ({
          nodeUrls: initialState.nodeUrls,
          baseUrl: initialState.nodeUrls.includes(s.baseUrl ?? '')
            ? s.baseUrl
            : initialState.baseUrl,
        })),
      setPrimaryDevice: (isPrimaryDevice) => set({ isPrimaryDevice }),
      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
      setLanguageTag: (languageTag) => set({ languageTag }),
      resetLanguageTag: () => set({ languageTag: initialState.languageTag }),
      toggleSearchModal: () =>
        set((s) => ({ isSearchModalOpen: !s.isSearchModalOpen })),
      reset: () => set(initialState),
    }),
    { name: 'settings', storage: createJSONStorage(() => localforage) },
  ),
);
