import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { PreferredView } from '@/types/dashboard';
import type { AuthData } from '@/types';
import { encryptedUserDataQueryOptions } from '@/hooks/queries/backup';
import { queryClient } from '@/lib/queryClient';
import { hash } from '@/utils/crypto';

export interface ProfileState {
  authData: AuthData | null;
  authKey: string | null;
  brightIdBackupEncrypted: string | null;
  splashScreenShown: boolean;
  playerOnboardingScreenShown: boolean;
  preferredView: PreferredView;
}

interface ProfileActions {
  setAuthData: (data: AuthData | null) => void;
  setSplashScreenShown: (value: boolean) => void;
  setPlayerOnboardingScreenShown: (value: boolean) => void;
  setPreferredView: (view: PreferredView) => void;
  setBrightIdBackupEncrypted: (value: string | null) => void;
  login: (authData: AuthData) => Promise<void>;
  getBrightIdBackup: (authKey: string) => Promise<string>;
  reset: () => void;
}

const initialState: ProfileState = {
  authData: null,
  authKey: null,
  brightIdBackupEncrypted: null,
  splashScreenShown: false,
  playerOnboardingScreenShown: false,
  preferredView: PreferredView.PLAYER,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      ...initialState,
      setAuthData: (authData) => set({ authData, authKey: authData ? hash(authData.brightId + authData.password) : null }),
      setSplashScreenShown: (splashScreenShown) => set({ splashScreenShown }),
      setPlayerOnboardingScreenShown: (playerOnboardingScreenShown) =>
        set({ playerOnboardingScreenShown }),
      setPreferredView: (preferredView) => set({ preferredView }),
      setBrightIdBackupEncrypted: (brightIdBackupEncrypted) =>
        set({ brightIdBackupEncrypted }),
      getBrightIdBackup: async (authKey) => {
        const backupData = await queryClient.fetchQuery(encryptedUserDataQueryOptions(authKey));
        queryClient.removeQueries({ queryKey: ['profile-photo'] });
        set({ brightIdBackupEncrypted: backupData });
        return backupData;
      },
      login: async ({ brightId, password }) => {
        const authKey = hash(brightId + password);
        const backupData = await queryClient.fetchQuery(encryptedUserDataQueryOptions(authKey));
        queryClient.removeQueries({ queryKey: ['profile-photo'] });
        set({ brightIdBackupEncrypted: backupData, authData: { brightId, password }, authKey });
      },
      reset: () =>
        set((s) => ({
          ...initialState,
          splashScreenShown: s.splashScreenShown,
          playerOnboardingScreenShown: s.playerOnboardingScreenShown,
        })),
    }),
    { name: 'profile', storage: createJSONStorage(() => localforage) },
  ),
);
