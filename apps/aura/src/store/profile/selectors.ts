import { createSelector } from '@reduxjs/toolkit';
import { decryptUserData } from '@/utils/crypto';

import { BrightIdBackup } from '../../types';
import { RootState } from '..';

export const selectAuthData = createSelector(
  (state: RootState) => state.profile,
  (profile) => profile.authData,
);
export const selectIsLoggedIn = createSelector(
  (state: RootState) => state.profile,
  (profile) => !!profile.authData,
);
export const selectSplashScreenShown = createSelector(
  (state: RootState) => state.profile,
  (profile) => profile.splashScreenShown,
);
export const selectPlayerOnboardingScreenShown = createSelector(
  (state: RootState) => state.profile,
  (profile) => profile.playerOnboardingScreenShown,
);
export const selectPreferredView = createSelector(
  (state: RootState) => state.profile,
  (profile) => profile.preferredView,
);
export const selectBrightIdBackup = createSelector(
  (state: RootState) => state.profile,
  (profile) => {
    const backupEncrypted = profile.brightIdBackupEncrypted;
    const password = profile.authData?.password;
    if (!backupEncrypted || !password) return null;
    return decryptUserData(backupEncrypted, password) as BrightIdBackup;
  },
);
