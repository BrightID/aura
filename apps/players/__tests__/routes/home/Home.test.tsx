import { setupServer } from 'msw/node';
import { act } from 'react';
import {
  backupInterceptor,
  makeMockInboundInterceptor,
  makeMockOutboundInterceptor,
  mockProfilePhoto,
  profileInterceptor,
} from '../../utils/api/server';
import { renderWithRouterAndRedux } from '../../utils/app';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';
import HomePage from '@/app/routes/_app.home/route';
import { SubjectsListContextProvider } from '@/contexts/SubjectsListContext';
import {
  generateRandomBrightIdConnectionBackup,
  mockedBrightIdProfileData,
  TEST_BRIGHT_ID,
} from '../../utils/api/profile';
import { http, HttpResponse } from 'msw';
import * as profileActions from '@/store/profile/actions';
import { waitFor } from '@testing-library/react';
import useBrightIdBackupWithUpdatedConnectionData from 'hooks/useBrightIdBackupWithAuraConnectionData';

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

describe('Home Subject Card', () => {
  it('Should not refetch if all the profiles have been fetched previously', async () => {
    const mockedBackupThunk = vi.spyOn(
      profileActions,
      'getBrightIdBackupThunk',
    );
    const Component = () => {
      const backup = useBrightIdBackupWithUpdatedConnectionData();

      return null;
    };

    const allConnectionsId = [
      ...outboundConnections,
      ...inboundConnections,
    ].reduce(
      (prev, curr) => {
        prev[curr.id] = new Date().getTime();
        return prev;
      },
      {} as Record<string, number>,
    );

    await act(() => {
      renderWithRouterAndRedux(<Component />, {
        redux: {
          preloadedState: {
            cache: { fetchedSubjectsFromProfile: allConnectionsId },
          },
        },
        router: {
          initialEntries: ['/home'],
        },
      });
    });

    expect(mockedBackupThunk).not.toHaveBeenCalled();
  });

  it('Should render the subject card', async () => {
    const mockedBackupThunk = vi.spyOn(
      profileActions,
      'getBrightIdBackupThunk',
    );
    await act(() =>
      renderWithRouterAndRedux(
        <RefreshEvaluationsContextProvider>
          <MyEvaluationsContextProvider>
            <SubjectsListContextProvider>
              <HomePage />
            </SubjectsListContextProvider>
          </MyEvaluationsContextProvider>
        </RefreshEvaluationsContextProvider>,
        {
          router: {
            initialEntries: ['/home'],
          },
        },
      ),
    );

    await waitFor(() => {
      expect(mockedBackupThunk).toHaveBeenCalled();
    });
  });

  it('Should refetch the backup if a subject exists in connections without a backup', async () => {
    const mockedBackupThunk = vi.spyOn(
      profileActions,
      'getBrightIdBackupThunk',
    );

    const Component = () => {
      const backup = useBrightIdBackupWithUpdatedConnectionData();

      return null;
    };

    await act(() =>
      renderWithRouterAndRedux(<Component />, {
        router: {
          initialEntries: ['/home'],
        },
      }),
    );

    await waitFor(() => {
      expect(mockedBackupThunk).toHaveBeenCalled();
    });
  });
});
