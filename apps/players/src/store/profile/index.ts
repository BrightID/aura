import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/BrightID/actions';
import { PreferredView } from '@/types/dashboard';

import { AuthData } from '../../types';
import { getBrightIdBackupThunk, loginThunk } from './actions';

export type ProfileState = {
  authData: AuthData | null;
  brightIdBackupEncrypted: string | null;
  splashScreenShown: boolean;
  playerOnboardingScreenShown: boolean;
  preferredView: PreferredView;
};

const initialProfileState: ProfileState = {
  authData: null,
  brightIdBackupEncrypted: null,
  splashScreenShown: false,
  playerOnboardingScreenShown: false,
  preferredView: PreferredView.PLAYER,
};
export const SET_SPLASH_SCREEN_SHOWN = 'SET_SPLASH_SCREEN_SHOWN';

export const setSplashScreenShown = (value: boolean) => ({
  type: SET_SPLASH_SCREEN_SHOWN,
  payload: value,
});
export const SET_PLAYER_ONBOARDING_SCREEN_SHOWN =
  'SET_PLAYER_ONBOARDING_SCREEN_SHOWN';

export const setPlayerOnboardingScreenShown = (value: boolean) => ({
  type: SET_PLAYER_ONBOARDING_SCREEN_SHOWN,
  payload: value,
});
export const SET_PREFERRED_VIEW = 'SET_PREFERRED_VIEW';

export const setPreferredView = (value: PreferredView) => ({
  type: SET_PREFERRED_VIEW,
  payload: value,
});

export const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.authData = action.payload;
      })
      .addCase(getBrightIdBackupThunk.fulfilled, (state, action) => {
        state.brightIdBackupEncrypted = action.payload;
      })
      .addMatcher(
        (action) => action.type === RESET_STORE,
        (state) => {
          console.log('logout called');
          return {
            ...initialProfileState,
            playerOnboardingScreenShown: state.playerOnboardingScreenShown,
            splashScreenShown: state.splashScreenShown,
          };
        },
      )
      .addMatcher(
        (action) => action.type === SET_SPLASH_SCREEN_SHOWN,
        (state, action: PayloadAction<boolean>) => {
          state.splashScreenShown = action.payload;
        },
      )
      .addMatcher(
        (action) => action.type === SET_PLAYER_ONBOARDING_SCREEN_SHOWN,
        (state, action: PayloadAction<boolean>) => {
          state.playerOnboardingScreenShown = action.payload;
        },
      )
      .addMatcher(
        (action) => action.type === SET_PREFERRED_VIEW,
        (state, action: PayloadAction<PreferredView>) => {
          state.preferredView = action.payload;
        },
      );
  },
});
