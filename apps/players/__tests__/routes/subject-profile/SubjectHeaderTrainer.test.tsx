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

const createOutboundMockedDataForValidTrainer = () => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup();
  mockedOutboundData.data.connections.push(connection);

  connection.auraEvaluations?.push({
    domain: 'BrightID',
    category: EvaluationCategory.TRAINER,
    confidence: 4,
    evaluation: EvaluationValue.POSITIVE,
    modified: new Date().getTime() / 1000,
  });

  const domains =
    mockedOutboundData.data.connections[0].verifications![0].domains!;

  domains[0].categories.push(
    createSubjectCategory(
      EvaluationCategory.TRAINER,
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

const outboundData = createOutboundMockedDataForValidTrainer();

const server = setupServer(
  makeMockOutboundInterceptor(outboundData),
  profileInterceptor,
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Should render the header with trainer', () => {
  it('Should render subject and trainer tab', async () => {
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
        expect(screen.getByTestId('subject-view-Trainer')).toBeInTheDocument();
        expect(
          screen.queryByTestId('subject-view-Player'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('subject-view-Manager'),
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('Should render the component on trainer mode', async () => {
    await act(() =>
      renderWithRouterAndRedux(<SubjectProfileHeader />, {
        router: {
          initialEntries: ['/subject/' + TEST_BRIGHT_ID + '?viewas=trainer'],
        },
      }),
    );

    expect(screen.getByTestId('header-title')).toHaveTextContent(
      'Trainer Profile',
    );
  });
});
