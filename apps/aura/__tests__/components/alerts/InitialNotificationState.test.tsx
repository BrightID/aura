import { AppDispatch, configureAppStore, RootState } from '@/store';
import { BrightIdBackupConnection } from '@/types';
import { EvaluationCategory, EvaluationValue } from '@/types/dashboard';
import { EnhancedStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  generateRandomBrightIdConnectionBackup,
  createSubjectCategory,
  generateEvaluationImpact,
  TEST_BRIGHT_ID,
  mockedBrightIdProfileData,
  generateRandomBrightId,
  mockOutboundData,
} from '../../utils/api/profile';
import {
  makeMockInboundInterceptor,
  makeMockOutboundInterceptor,
} from '../../utils/api/server';
import { triggerNotificationFetch } from '@/store/notifications';

const createMockStore = (): EnhancedStore => {
  return configureAppStore().store;
};

const createMockedOutboundData = () => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection1 = generateRandomBrightIdConnectionBackup('already known');

  connection1.verifications![0].domains![0].categories.push(
    createSubjectCategory(EvaluationCategory.SUBJECT, [
      {
        evaluator: generateRandomBrightId(),
        confidence: 4,
        evaluatorName: '',
        impact: 5000,
        modified: Date.now(),
        score: 1250,
      },
    ]),
  );

  connection1.auraEvaluations!.push({
    category: EvaluationCategory.SUBJECT,
    confidence: 4,
    domain: 'BrightID',
    evaluation: EvaluationValue.POSITIVE,
    modified: Date.now(),
  });

  const connection2 = generateRandomBrightIdConnectionBackup('just met');

  connection2.verifications![0].domains![0].categories.push(
    createSubjectCategory(EvaluationCategory.SUBJECT, [
      {
        evaluator: generateRandomBrightId(),
        confidence: 2,
        evaluatorName: '',
        impact: 5000,
        modified: Date.now(),
        score: 2500,
      },
    ]),
  );

  connection2.auraEvaluations!.push({
    category: EvaluationCategory.SUBJECT,
    confidence: 4,
    domain: 'BrightID',
    evaluation: EvaluationValue.POSITIVE,
    modified: Date.now(),
  });

  mockedOutboundData.data.connections.push(connection1, connection2);

  return mockedOutboundData;
};

const createMockedData = () => {
  const mockedInboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup('already known');
  mockedInboundData.data.connections.push(
    connection,
    generateRandomBrightIdConnectionBackup('just met'),
    generateRandomBrightIdConnectionBackup('recovery'),
    generateRandomBrightIdConnectionBackup('reported'),
  );

  const customUser = generateRandomBrightIdConnectionBackup('suspicious');

  customUser.auraEvaluations!.push({
    category: EvaluationCategory.SUBJECT,
    confidence: 4,
    domain: 'BrightID',
    evaluation: EvaluationValue.NEGATIVE,
    modified: Date.now(),
  });

  mockedInboundData.data.connections.push(customUser);

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

  const mockedProfileData = { ...mockedBrightIdProfileData };

  mockedBrightIdProfileData.data.verifications![0].domains![0].categories[0].impacts.push(
    {
      confidence: -4,
      evaluator: customUser.id,
      impact: -20000,
      modified: Date.now(),
      score: 4000,
      level: 1,
    },
  );

  return {
    mockedInboundData,
    mockedProfileData,
    customUser,
    mockedOutboundData: createMockedOutboundData(),
  };
};

const { mockedInboundData, mockedProfileData, mockedOutboundData } =
  createMockedData();

const profileInterceptor = http.get(
  `/auranode-test/brightid/v6/users/${TEST_BRIGHT_ID}/profile`,
  () => HttpResponse.json(mockedProfileData),
);

export const restHandlers = [
  profileInterceptor,
  makeMockInboundInterceptor(mockedInboundData, TEST_BRIGHT_ID),
  makeMockOutboundInterceptor(mockedOutboundData, TEST_BRIGHT_ID),
];

const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe('Notification Initial State', () => {
  let store: EnhancedStore;
  let dispatch: AppDispatch;
  let getState: () => RootState;

  beforeEach(() => {
    store = createMockStore();
    dispatch = store.dispatch;
    getState = store.getState;
    vi.clearAllMocks();
  });

  it('Should generate no new notifications while tracking profiles', async () => {
    await triggerNotificationFetch(getState, dispatch, TEST_BRIGHT_ID);

    const {
      alerts,
      inboundTrackedProfiles,
      outboundTrackedProfiles,
      lastFetch,
    } = getState().alerts;

    expect(alerts.length).toBe(0);
    expect(inboundTrackedProfiles.profiles.size).not.toBe(0);
    expect(outboundTrackedProfiles.profiles.size).not.toBe(0);

    expect(lastFetch).not.toBe(null);
  });
});
