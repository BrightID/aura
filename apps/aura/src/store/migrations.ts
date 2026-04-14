import { MigrationManifest } from 'redux-persist';
import { PreferredView } from '@/types/dashboard';

export const migrations: MigrationManifest = {
  1: (oldState: any) => {
    return {
      ...oldState,
      profile: {
        ...oldState.profile,
        splashScreenShown: false,
        playerOnboardingScreenShown: false,
      },
    };
  },
  2: (oldState: any) => {
    return {
      ...oldState,
      profile: {
        ...oldState.profile,
        preferredView: PreferredView.PLAYER,
      },
    };
  },
  3: (oldState: any) => {
    return {
      ...oldState,
      profile: {
        ...oldState.profile,
        authData: oldState.profile.authData
          ? {
              brightId: oldState.profile.authData.brightId,
              password: oldState.profile.authData.password,
            }
          : null,
      },
    };
  },
  4: (oldState: any) => {
    if (!oldState.keypair) return oldState;

    let newSecretKey = oldState.keypair.secretKey;

    try {
      atob(newSecretKey);
    } catch {
      newSecretKey = btoa(
        String.fromCharCode(...new Uint8Array(oldState.keypair.secretKey)),
      );
    }

    return {
      ...oldState,
      keypair: {
        ...oldState.keypair,
        secretKey: newSecretKey,
      },
    };
  },
  5: (oldState: any) => {
    return {
      ...oldState,
      notifications: {
        ...oldState.notifications,
        items: [],
      },
    };
  },
  6: (oldState: any) => {
    return {
      ...oldState,
      notifications: {
        ...oldState.notifications,
        items: [],
      },
    };
  },
};
