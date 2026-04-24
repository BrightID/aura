import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  TEST_BRIGHT_ID,
  mockedBrightIdProfileData,
  generateRandomBrightIdConnectionBackup,
} from '../utils/api/profile';
import {
  backupInterceptor,
  profileInterceptor,
  mockProfilePhoto,
  makeMockInboundInterceptor,
  makeMockOutboundInterceptor,
} from '../utils/api/server';
import { renderWithRouterAndRedux } from '../utils/app';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { SubjectsListContextProvider } from '@/contexts/SubjectsListContext';
import HomePage from '@/app/routes/_app.home/route';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalSearchModal from '@/components/Shared/GlobalSearchModal';

export const customConnectionsInterceptor = http.get(
  `/auranode-test/brightid/v6/users/${TEST_BRIGHT_ID}/profile`,
  () => HttpResponse.json(mockedBrightIdProfileData),
);

const inboundConnections = Array.from({ length: 7 }).map(() =>
  generateRandomBrightIdConnectionBackup('already known'),
);

const outboundConnections = Array.from({ length: 7 }).map(() =>
  generateRandomBrightIdConnectionBackup('already known'),
);

const server = setupServer(
  backupInterceptor,
  profileInterceptor,
  mockProfilePhoto,
  makeMockInboundInterceptor({
    data: {
      connections: inboundConnections,
    },
  }),
  makeMockOutboundInterceptor({
    data: {
      connections: outboundConnections,
    },
  }),
);

server.events.on('unhandledException', (args) => {
  console.log('Unexpected request');
  console.log(args);
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Global search bar functionality', () => {
  it('Should open up the search bar when clicked', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
            <GlobalSearchModal />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId('global-search-btn')).toBeInTheDocument();
    });

    act(() => {
      userEvent.click(screen.getByTestId('global-search-btn'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('global-search-modal-title'),
      ).toBeInTheDocument();

      expect(screen.getByTestId('global-search-input')).toBeInTheDocument();
    });
  });

  it('Should filter up the results when searchbar is filled and done is clicked', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
            <GlobalSearchModal />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
      },
    );

    act(() => {
      userEvent.click(screen.getByTestId('global-search-btn'));
    });
    const connection = outboundConnections[0];

    act(() => {
      userEvent.type(screen.getByTestId('global-search-input'), connection.id);

      userEvent.click(screen.getByTestId('global-search-submit'));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`subject-card-${connection.id}-0`),
      ).toBeInTheDocument();

      outboundConnections.slice(1).forEach((connection) => {
        expect(
          screen.queryByTestId(`subject-card-${connection.id}`),
        ).not.toBeInTheDocument();
      });
    });
  });

  it('Should show nothing if no results were found', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectsListContextProvider>
            <HomePage />
            <GlobalSearchModal />
          </SubjectsListContextProvider>
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
      },
    );

    act(() => {
      userEvent.click(screen.getByTestId('global-search-btn'));
    });

    act(() => {
      userEvent.type(
        screen.getByTestId('global-search-input'),
        'INVALIDTEXTFORNOTFOUND',
      );

      userEvent.click(screen.getByTestId('global-search-submit'));
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId(`subject-list-no-result-text`),
      ).toBeInTheDocument();

      outboundConnections.forEach((connection) => {
        expect(
          screen.queryByTestId(`subject-card-${connection.id}`),
        ).not.toBeInTheDocument();
      });
    });
  });
});
