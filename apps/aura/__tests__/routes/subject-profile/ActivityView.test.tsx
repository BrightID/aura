import { setupServer } from 'msw/node';
import {
  backupInterceptor,
  makeMockInboundInterceptor,
  makeMockOutboundInterceptor,
  mockProfilePhoto,
  profileInterceptor,
} from '../../utils/api/server';
import { BrightIdBackupConnection } from '@/types';
import { EvaluationCategory, EvaluationValue } from '@/types/dashboard';
import { getRandomElement } from '@/utils/array';
import {
  generateRandomBrightIdConnectionBackup,
  createSubjectCategory,
  generateEvaluationImpact,
  TEST_BRIGHT_ID,
} from '../../utils/api/profile';
import { renderWithRouterAndRedux } from '../../utils/app';
import { SubjectProfileBody } from '@/app/routes/_app.subject.$id/route';

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

describe('It should render the activity tab', () => {
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

  it('Should render the correct activity data', async () => {
    // renderWithRouterAndRedux(
    //   <SubjectProfileBody subjectId={TEST_BRIGHT_ID} />,
    //   {
    //     router: {
    //       initialEntries: [`/subject/${TEST_BRIGHT_ID}`],
    //     },
    //     redux: {},
    //   },
    // );
  });

  it('Activity filters', async () => {
    // renderWithRouterAndRedux(
    //   <SubjectProfileBody subjectId={TEST_BRIGHT_ID} />,
    //   {
    //     router: {
    //       initialEntries: [`/subject/${TEST_BRIGHT_ID}`],
    //     },
    //     redux: {},
    //   },
    // );
  });

  it('Activity search', async () => {
    // renderWithRouterAndRedux(
    //   <SubjectProfileBody subjectId={TEST_BRIGHT_ID} />,
    //   {
    //     router: {
    //       initialEntries: [`/subject/${TEST_BRIGHT_ID}`],
    //     },
    //     redux: {},
    //   },
    // );
  });
  it('Activity Sort', async () => {
    // renderWithRouterAndRedux(
    //   <SubjectProfileBody subjectId={TEST_BRIGHT_ID} />,
    //   {
    //     router: {
    //       initialEntries: [`/subject/${TEST_BRIGHT_ID}`],
    //     },
    //     redux: {},
    //   },
    // );
  });
});
