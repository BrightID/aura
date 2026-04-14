import { SubjectCard } from '@/components/EvaluationFlow/SubjectCard';
import { screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { renderWithRouterAndRedux } from '../utils/app';
import {
  BRIGHTID_BACKUP,
  createSubjectCategory,
  findProfileCategory,
  generateEvaluationImpact,
  generateRandomBrightIdConnectionBackup,
  mockedBrightIdProfileData,
  TEST_BRIGHT_ID,
} from '../utils/api/profile';
import { MyEvaluationsContextProvider } from '@/contexts/MyEvaluationsContext';
import { RefreshEvaluationsContextProvider } from '@/contexts/RefreshEvaluationsContext';
import {
  backupInterceptor,
  makeMockInboundInterceptor,
  makeMockOutboundInterceptor,
  mockProfilePhoto,
  profileInterceptor,
} from '../utils/api/server';
import { BrightIdBackupConnection } from '@/types';
import { EvaluationCategory, EvaluationValue } from '@/types/dashboard';
import { compactFormat } from '@/utils/number';
import { getRandomElement } from '@/utils/array';
import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import { calculateUserScorePercentage } from '@/utils/score';

const createOutboundMockedData = (count = 1) => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  for (let i = 0; i < count; i++) {
    const connection = generateRandomBrightIdConnectionBackup();

    const domains = connection.verifications![0].domains!;
    connection.auraEvaluations?.push({
      domain: 'BrightID',
      category: EvaluationCategory.SUBJECT,
      confidence: getRandomElement([1, 2, 3, 4]),
      evaluation: EvaluationValue.POSITIVE,
      modified: new Date().getTime() / 1000,
    });

    domains[0].categories.push(
      createSubjectCategory(EvaluationCategory.SUBJECT, [
        generateEvaluationImpact(
          TEST_BRIGHT_ID,
          Math.floor(Math.random() * 100000),
          connection.auraEvaluations![0].confidence,
          Math.floor(Math.random() * 100000),
        ),
      ]),
    );

    mockedOutboundData.data.connections.push(connection);
  }

  return mockedOutboundData;
};

const createInboundMockedData = () => {
  const mockedInboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup('already known');
  mockedInboundData.data.connections.push(
    connection,
    generateRandomBrightIdConnectionBackup('just met'),
    generateRandomBrightIdConnectionBackup('recovery'),
    generateRandomBrightIdConnectionBackup('reported'),
    generateRandomBrightIdConnectionBackup('suspicious'),
  );

  const domains =
    mockedInboundData.data.connections[0].verifications![0].domains!;

  domains[0].categories.push(
    createSubjectCategory(
      EvaluationCategory.SUBJECT,
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

  return mockedInboundData;
};

describe('Subject card functionality', () => {
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

  it('Should render the component with the correct info', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          <SubjectCard
            verifications={mockedBrightIdProfileData.data.verifications}
            index={0}
            subjectId={TEST_BRIGHT_ID}
          />
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId(`subject-item-0-level`)).toHaveTextContent(
        findProfileCategory(
          mockedBrightIdProfileData,
          'subject',
        ).level.toString(),
      );

      expect(screen.getByTestId(`subject-item-0-score`)).toHaveTextContent(
        compactFormat(
          findProfileCategory(mockedBrightIdProfileData, 'subject').score,
        ),
      );

      expect(screen.getByTestId(`subject-item-0-name`)).toHaveTextContent(
        BRIGHTID_BACKUP.userData.name,
      );

      expect(
        screen.getByTestId(`subject-card-${TEST_BRIGHT_ID}`),
      ).toHaveAttribute('href', `/subject/${TEST_BRIGHT_ID}`);
    });
  });
});

describe('Connection type states', () => {
  const outboundData = createOutboundMockedData();
  const inboundData = createInboundMockedData();

  const restListeners = [
    profileInterceptor,
    backupInterceptor,
    makeMockOutboundInterceptor(outboundData),
    makeMockInboundInterceptor(inboundData),
  ];

  const server = setupServer(...restListeners);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('Should render the component with the correct info', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          {outboundData.data.connections.map((connection, key) => (
            <SubjectCard
              verifications={connection.verifications}
              index={key}
              subjectId={connection.id}
              key={connection.id}
            />
          ))}
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      outboundData.data.connections.forEach((conn) => {
        expect(
          screen.getByTestId(`subject-${conn.id}-connection-${conn.level}`),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Evaluation State', () => {
  const outboundData = createOutboundMockedData();
  const inboundData = createInboundMockedData();

  const restListeners = [
    profileInterceptor,
    backupInterceptor,
    mockProfilePhoto,
    makeMockOutboundInterceptor(outboundData),
    makeMockInboundInterceptor(inboundData),
  ];

  const server = setupServer(...restListeners);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should render the correct evaluation status', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          {outboundData.data.connections.map((connection, key) => (
            <SubjectCard
              verifications={connection.verifications}
              index={key}
              subjectId={connection.id}
              key={connection.id}
            />
          ))}
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      outboundData.data.connections.forEach((conn) => {
        expect(
          screen.getByTestId(`subject-${conn.id}-evaluation`),
        ).toBeInTheDocument();

        expect(
          screen.getByTestId(
            `subject-${conn.id}-evaluation-${getAuraVerification(conn.verifications, EvaluationCategory.SUBJECT)?.impacts[0].confidence}`,
          ),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Score bar progress', () => {
  const outboundData = createOutboundMockedData();
  const inboundData = createInboundMockedData();

  const restListeners = [
    profileInterceptor,
    backupInterceptor,
    mockProfilePhoto,
    makeMockOutboundInterceptor(outboundData),
    makeMockInboundInterceptor(inboundData),
    // http.get(`/auranode-test/brightid/v6/users/*/profile`, ({ params }) =>
    //   HttpResponse.json(outboundData[params.]),
    // ),
  ];

  const server = setupServer(...restListeners);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('Should calculate the correct progress bar for each subject', async () => {
    renderWithRouterAndRedux(
      <RefreshEvaluationsContextProvider>
        <MyEvaluationsContextProvider>
          {outboundData.data.connections.map((connection, key) => (
            <SubjectCard
              verifications={connection.verifications}
              subjectId={connection.id}
              key={connection.id}
            />
          ))}
        </MyEvaluationsContextProvider>
      </RefreshEvaluationsContextProvider>,
      {
        router: { initialEntries: ['/home'] },
      },
    );

    await waitFor(() => {
      outboundData.data.connections.forEach((conn) => {
        const progress = calculateUserScorePercentage(
          EvaluationCategory.SUBJECT,
          getAuraVerification(conn.verifications, EvaluationCategory.SUBJECT)
            ?.score ?? 0,
        );

        expect(
          screen.getByTestId(`subject-${conn.id}-score-progress-${progress}`),
        ).toBeInTheDocument();
      });
    });
  });
});
