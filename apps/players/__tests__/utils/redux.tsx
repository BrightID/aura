import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { AppStore, RootState } from '../../src/store';
import { configureAppStore } from '../../src/store';
import {
  BRIGHTID_BACKUP,
  TEST_BRIGHT_ID,
  TEST_BRIGHT_PASSWORD,
} from './api/profile';
import { ProfileState } from '@/store/profile';
import { encryptData } from '@/utils/crypto';
import { PreferredView } from '@/types/dashboard';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
export interface ExtendedReduxRenderOptions
  extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedReduxRenderOptions = {},
) {
  const {
    store = configureAppStore({
      profile: {
        authData: {
          brightId: TEST_BRIGHT_ID,
          password: TEST_BRIGHT_PASSWORD,
        },
        brightIdBackupEncrypted: encryptData(
          JSON.stringify(BRIGHTID_BACKUP),
          TEST_BRIGHT_PASSWORD,
        ),
        preferredView: PreferredView.PLAYER,
      } as ProfileState,
    }).store,
    ...renderOptions
  } = extendedRenderOptions;

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
