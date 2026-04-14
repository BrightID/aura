import { render } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { ExtendedReduxRenderOptions } from './redux';
import { ProfileState } from '@/store/profile';
import { PreferredView } from '@/types/dashboard';
import {
  BRIGHTID_BACKUP,
  TEST_BRIGHT_ID,
  TEST_BRIGHT_PASSWORD,
} from './api/profile';
import { encryptData } from '@/utils/crypto';
import { configureAppStore } from '@/store';
import { Provider } from 'react-redux';

interface ExtendedRenderOptions {
  initialEntries?: string[];
}

export function renderWithRouter(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const RouterContainer: FC<PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={extendedRenderOptions.initialEntries}>
      {children}
    </MemoryRouter>
  );

  return render(ui, { wrapper: RouterContainer });
}

export function renderWithRouterAndRedux(
  ui: React.ReactElement,
  extendedOptions: {
    router?: ExtendedRenderOptions;
    redux?: ExtendedReduxRenderOptions;
  },
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
        ...(extendedOptions.redux?.preloadedState ?? {}),
      } as ProfileState,
      ...extendedOptions.redux?.preloadedState,
    }).store,
    ...renderOptions
  } = extendedOptions.redux ?? {};

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={extendedOptions.router?.initialEntries}>
        {children}
      </MemoryRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
