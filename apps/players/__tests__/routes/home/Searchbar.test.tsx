import { SubjectListControls } from '@/components/EvaluationFlow/SubjectListControls';
import { renderWithRouterAndRedux } from '../../utils/app';
import { SubjectsListContextProvider } from '@/contexts/SubjectsListContext';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrightIdBackupConnection } from '@/types';
import { generateRandomBrightIdConnectionBackup } from '../../utils/api/profile';
import { setupServer } from 'msw/node';
import {
  profileInterceptor,
  backupInterceptor,
  makeMockOutboundInterceptor,
} from '../../utils/api/server';

const createOutboundMockedData = () => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup();
  mockedOutboundData.data.connections.push(
    connection,
    generateRandomBrightIdConnectionBackup(),
    generateRandomBrightIdConnectionBackup(),
    generateRandomBrightIdConnectionBackup(),
    generateRandomBrightIdConnectionBackup(),
  );

  return mockedOutboundData;
};

const outboundData = createOutboundMockedData();

const restListeners = [
  profileInterceptor,
  backupInterceptor,
  makeMockOutboundInterceptor(outboundData),
];

const server = setupServer(...restListeners);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Search bar', () => {
  it('Should render the searchbar inside the homepage', async () => {
    renderWithRouterAndRedux(
      <MyEvaluationsContextProvider>
        <SubjectsListContextProvider>
          <SubjectListControls
            refreshBrightIdBackup={() => {}}
            loading={false}
          />
        </SubjectsListContextProvider>
      </MyEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-searchbar')).toBeInTheDocument();
    });
  });

  it('Should filter the results based on the search', async () => {
    renderWithRouterAndRedux(
      <MyEvaluationsContextProvider>
        <SubjectsListContextProvider>
          <SubjectListControls
            refreshBrightIdBackup={() => {}}
            loading={false}
          />
        </SubjectsListContextProvider>
      </MyEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
        redux: {},
      },
    );

    await act(() => {
      userEvent.type(
        screen.getByTestId('home-searchbar'),
        outboundData.data.connections[0].name ??
          outboundData.data.connections[0].id,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('home-subject-results')).toHaveTextContent(
        /1 result/i,
      );
    });
  });

  it('Should show the empty state while the search is not found', async () => {
    renderWithRouterAndRedux(
      <MyEvaluationsContextProvider>
        <SubjectsListContextProvider>
          <SubjectListControls
            refreshBrightIdBackup={() => {}}
            loading={false}
          />
        </SubjectsListContextProvider>
      </MyEvaluationsContextProvider>,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-searchbar')).toBeInTheDocument();
    });

    userEvent.clear(screen.getByTestId('home-searchbar'));
    userEvent.type(
      screen.getByTestId('home-searchbar'),
      'nonexistentsearchterm',
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-subject-results')).toHaveTextContent(
        /0 results/i,
      );
    });
  });

  it('Should show all the connections when searchbar is empty', async () => {
    renderWithRouterAndRedux(
      <MyEvaluationsContextProvider>
        <SubjectsListContextProvider>
          <SubjectListControls
            refreshBrightIdBackup={() => {}}
            loading={false}
          />
        </SubjectsListContextProvider>
      </MyEvaluationsContextProvider>,
      {
        router: {
          initialEntries: ['/home'],
        },
        redux: {},
      },
    );

    await act(() => {
      userEvent.clear(screen.getByTestId('home-searchbar'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('home-subject-results')).toHaveTextContent(
        /5 results/i,
      );
    });
  });
});
