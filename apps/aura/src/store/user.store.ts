import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

export interface UserState {
  isSponsored: boolean;
  isSponsoredv6: boolean;
  name: string;
  photo: { filename: string };
  searchParam: string;
  backupCompleted: boolean;
  id: string;
  password: string;
  verifications: Verification[];
  secretKey: string;
  eula: boolean;
  updateTimestamps: {
    backupCompleted: number;
    isSponsored: number;
    isSponsoredv6: number;
    photo: number;
    name: number;
    password: number;
  };
  localServerUrl: string;
}

interface UserActions {
  setIsSponsored: (value: boolean) => void;
  setIsSponsoredv6: (value: boolean) => void;
  setPhoto: (photo: { filename: string }) => void;
  setSearchParam: (param: string) => void;
  setEula: (value: boolean) => void;
  setUserData: (data: { id: string; name: string; photo: { filename: string }; secretKey: string }) => void;
  setName: (name: string) => void;
  setBackupCompleted: (value: boolean) => void;
  setPassword: (password: string) => void;
  setUserId: (id: string) => void;
  setVerifications: (verifications: Verification[]) => void;
  hydrateUser: (data: { name: string; photo: { filename: string }; backupCompleted: boolean; id: string; password: string }) => void;
  setLocalServerUrl: (url: string) => void;
  reset: () => void;
}

const initialState: UserState = {
  isSponsored: false,
  isSponsoredv6: false,
  name: '',
  photo: { filename: '' },
  searchParam: '',
  backupCompleted: false,
  id: '',
  password: '',
  verifications: [],
  secretKey: '',
  eula: false,
  updateTimestamps: {
    backupCompleted: 0,
    isSponsored: 0,
    isSponsoredv6: 0,
    photo: 0,
    name: 0,
    password: 0,
  },
  localServerUrl: '',
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,
      setIsSponsored: (value) =>
        set((s) => ({ isSponsored: value, updateTimestamps: { ...s.updateTimestamps, isSponsored: Date.now() } })),
      setIsSponsoredv6: (value) =>
        set((s) => ({ isSponsoredv6: value, updateTimestamps: { ...s.updateTimestamps, isSponsoredv6: Date.now() } })),
      setPhoto: (photo) =>
        set((s) => ({ photo, updateTimestamps: { ...s.updateTimestamps, photo: Date.now() } })),
      setSearchParam: (searchParam) => set({ searchParam }),
      setEula: (eula) => set({ eula }),
      setUserData: ({ id, name, photo, secretKey }) => {
        const t = Date.now();
        set((s) => ({ id, name, photo, secretKey, updateTimestamps: { ...s.updateTimestamps, name: t, photo: t } }));
      },
      setName: (name) =>
        set((s) => ({ name, updateTimestamps: { ...s.updateTimestamps, name: Date.now() } })),
      setBackupCompleted: (backupCompleted) =>
        set((s) => ({ backupCompleted, updateTimestamps: { ...s.updateTimestamps, backupCompleted: Date.now() } })),
      setPassword: (password) =>
        set((s) => ({ password, updateTimestamps: { ...s.updateTimestamps, password: Date.now() } })),
      setUserId: (id) => set({ id }),
      setVerifications: (verifications) => set({ verifications }),
      hydrateUser: ({ name, photo, backupCompleted, id, password }) =>
        set({ name, photo, backupCompleted, id, password }),
      setLocalServerUrl: (localServerUrl) => set({ localServerUrl }),
      reset: () => set(initialState),
    }),
    { name: 'user', storage: createJSONStorage(() => localforage) },
  ),
);

export const selectIsSponsored = () => {
  const { isSponsored, isSponsoredv6 } = useUserStore.getState();
  return isSponsored || isSponsoredv6;
};
