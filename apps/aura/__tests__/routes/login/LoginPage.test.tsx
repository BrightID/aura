import { act, screen, waitFor } from '@testing-library/react';
import { renderWithRouterAndRedux } from '../../utils/app';
import Login from '@/app/routes/_landing._index/route';
import RecoveryCodeScreen from '@/features/brightid/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as channelThunks from '@/features/brightid/components/Onboarding/ImportFlow/thunks/channelThunks';
import * as channelDownloadThunk from '@/features/brightid/components/Onboarding/ImportFlow/thunks/channelDownloadThunks';
import { TEST_BRIGHT_ID } from '../../utils/api/profile';

describe('Should render the login component', () => {
  it('Should render the login component', async () => {
    await act(() =>
      renderWithRouterAndRedux(<Login />, {
        router: { initialEntries: ['/'] },
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-title')).toBeInTheDocument();
      expect(screen.getByTestId('splash-dismiss-btn')).toHaveTextContent(
        'Get Started',
      );
    });
  });

  it('Should show the qr code after dissmiss', async () => {
    await act(() =>
      renderWithRouterAndRedux(<Login />, {
        router: { initialEntries: ['/'] },
      }),
    );
    const dismissButton = screen.getByTestId('splash-dismiss-btn');

    await act(() => {
      dismissButton.click();
    });

    await waitFor(() => {
      expect(dismissButton).not.toBeInTheDocument();
      expect(screen.getByTestId('recovery-title')).toBeInTheDocument();
    });
  });
});

describe('login behavior and functionality', () => {
  const handlers = [
    http.get('/auranode*/profile/list/*', async () => {
      return HttpResponse.json({ profileIds: ['data'] });
    }),
    http.post('/auranode*/profile/upload/*', () =>
      HttpResponse.json({ success: true }),
    ),
  ];

  const server = setupServer(...handlers);
  beforeAll(() => {
    vi.useFakeTimers();

    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => {
    vi.useRealTimers();
    server.close();
  });

  it('Should login after the qr code is scanned', async () => {
    const spy = vi.spyOn(channelThunks, 'pollImportChannel');

    // Render the component
    renderWithRouterAndRedux(<RecoveryCodeScreen />, {
      router: { initialEntries: ['/'] },
    });

    // Wait for the API to be called
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    // Fast-forward 5 seconds using fake timers
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Wait for the import link to be in the document
    const importLink = await screen.findByTestId('import-universal-link');
    const importQrCode = await screen.findByTestId('import-universal-qr-code');
    expect(importLink).toBeInTheDocument();
    expect(importQrCode).toBeInTheDocument();
  });
});

describe('login success', () => {
  const handlers = [
    http.get('/auranode*/profile/list/*', async () => {
      return HttpResponse.json({
        profileIds: [
          'data',
          `sig_userinfo_${TEST_BRIGHT_ID}:${TEST_BRIGHT_ID}`,
        ],
      });
    }),
    http.get('/auranode*/profile/download/:signkey/*', async ({ params }) => {
      return HttpResponse.json({
        data: '',
      });
    }),
    http.delete('/auranode*/profile/*/*', async () => {
      return HttpResponse.json({
        success: true,
      });
    }),
    http.post('/auranode*/profile/upload/*', () =>
      HttpResponse.json({ success: true }),
    ),
  ];

  const server = setupServer(...handlers);
  beforeAll(() => {
    vi.useFakeTimers();

    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  afterAll(() => {
    vi.useRealTimers();
    server.close();
  });

  it('Should start to download the data', async () => {
    const spy = vi.spyOn(channelDownloadThunk, 'downloadUserInfo');

    renderWithRouterAndRedux(<RecoveryCodeScreen />, {
      router: { initialEntries: ['/'] },
    });

    await waitFor(
      () => {
        expect(spy).toHaveBeenCalled();
      },
      {
        timeout: 5000,
      },
    );
  });
  // TODO: add complete login functionality
});
