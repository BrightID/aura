import SubjectProfileHeader from '@/app/routes/_app.subject.$id/components/header';
import { BrightIdBackupConnection } from '@/types';
import { EvaluationCategory, EvaluationValue } from '@/types/dashboard';
import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { act } from 'react';
import {
  TEST_BRIGHT_ID,
  generateRandomBrightIdConnectionBackup,
  createSubjectCategory,
  generateEvaluationImpact,
} from '../../utils/api/profile';
import {
  makeMockOutboundInterceptor,
  profileInterceptor,
} from '../../utils/api/server';
import { renderWithRouterAndRedux } from '../../utils/app';

const createOutboundMockedDataForValidPlayer = () => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup();
  mockedOutboundData.data.connections.push(connection);

  connection.auraEvaluations?.push({
    domain: 'BrightID',
    category: EvaluationCategory.PLAYER,
    confidence: 4,
    evaluation: EvaluationValue.POSITIVE,
    modified: new Date().getTime() / 1000,
  });

  const domains =
    mockedOutboundData.data.connections[0].verifications![0].domains!;

  domains[0].categories.push(
    createSubjectCategory(
      EvaluationCategory.PLAYER,
      [
        generateEvaluationImpact(
          TEST_BRIGHT_ID,
          Math.floor(Math.random() * 100000),
          4,
          Math.floor(Math.random() * 100000),
        ),
      ],
      1,
    ),
  );

  return mockedOutboundData;
};

const outboundData = createOutboundMockedDataForValidPlayer();

const server = setupServer(
  makeMockOutboundInterceptor(outboundData),
  profileInterceptor,
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Should render the header with permissions', () => {
  it('Should render subject and player tab', async () => {
    await act(() =>
      renderWithRouterAndRedux(<SubjectProfileHeader />, {
        router: {
          initialEntries: ['/subject/' + TEST_BRIGHT_ID],
        },
      }),
    );

    afterEach(() => server.resetHandlers());

    await waitFor(
      () => {
        expect(screen.getByTestId('subject-view-Subject')).toBeInTheDocument();
        expect(screen.getByTestId('subject-view-Player')).toBeInTheDocument();
        expect(
          screen.queryByTestId('subject-view-Trainer'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('subject-view-Manager'),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('Should render the component on player mode', async () => {
    await act(() =>
      renderWithRouterAndRedux(<SubjectProfileHeader />, {
        router: {
          initialEntries: ['/subject/' + TEST_BRIGHT_ID + '?viewas=player'],
        },
      }),
    );

    expect(screen.getByTestId('header-title')).toHaveTextContent(
      'Player Profile',
    );
  });
});
