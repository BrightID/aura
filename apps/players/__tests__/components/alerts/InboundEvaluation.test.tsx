import { AppDispatch, configureAppStore, RootState } from '@/store';
import { updateInboundData } from '@/store/notifications';
import {
  createSubjectCategory,
  generateEvaluationImpact,
  generateRandomBrightIdConnectionBackup,
  mockedBrightIdProfileData,
  TEST_BRIGHT_ID,
  TEST_BRIGHT_PASSWORD,
} from '../../utils/api/profile';
import {
  EvaluationCategory,
  EvaluationValue,
  PreferredView,
} from '@/types/dashboard';
import { setupServer } from 'msw/node';
import { BrightIdBackupConnection } from '@/types';
import { http, HttpResponse } from 'msw';
import { makeMockInboundInterceptor } from '../../utils/api/server';
import { EnhancedStore } from '@reduxjs/toolkit';

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

  return { mockedInboundData, mockedProfileData, customUser };
};

const { mockedInboundData, mockedProfileData, customUser } = createMockedData();

const profileInterceptor = http.get(
  `/auranode-test/brightid/v6/users/${TEST_BRIGHT_ID}/profile`,
  () => HttpResponse.json(mockedProfileData),
);

export const restHandlers = [
  profileInterceptor,
  makeMockInboundInterceptor(mockedInboundData, TEST_BRIGHT_ID),
];

const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

const state: Partial<RootState> = {
  profile: {
    authData: {
      brightId: TEST_BRIGHT_ID,
      password: TEST_BRIGHT_PASSWORD,
    },
    brightIdBackupEncrypted: '',
    playerOnboardingScreenShown: true,
    preferredView: PreferredView.PLAYER,
    splashScreenShown: true,
  },

  alerts: {
    inboundTrackedProfiles: {
      isLoading: false,
      previousFetch: Date.now() - 5 * 600000,
      profiles: new Map(),
    },
    outboundTrackedProfiles: {
      isLoading: false,
      previousFetch: Date.now() - 5 * 600000,
      profiles: new Map(),
    },
    activityLogs: [],
    alerts: [],
    isInitialized: true,
    lastFetch: null,
  },
};

const createMockStore = (): EnhancedStore => {
  return configureAppStore(state).store;
};

describe('inbound notification generations', () => {
  let store: EnhancedStore;
  let dispatch: AppDispatch;
  let getState: () => RootState;

  beforeEach(() => {
    store = createMockStore();
    dispatch = store.dispatch;
    getState = store.getState;
    vi.clearAllMocks();
  });

  it('Should generate a notification when someone evaluates the user', async () => {
    await updateInboundData(getState, dispatch, TEST_BRIGHT_ID);

    const { inboundTrackedProfiles, alerts } = getState().alerts;

    expect(alerts.length).toBe(1);
    expect(inboundTrackedProfiles.profiles.get(customUser.id)).not.toBe(null);
  });

  it('Should generate nothing if the there is no new changes', async () => {
    await updateInboundData(getState, dispatch, TEST_BRIGHT_ID);

    let { inboundTrackedProfiles, alerts } = getState().alerts;

    expect(alerts.length).toBe(1);
    expect(inboundTrackedProfiles.profiles.get(customUser.id)).not.toBe(null);

    await updateInboundData(getState, dispatch, TEST_BRIGHT_ID);

    inboundTrackedProfiles = getState().alerts.inboundTrackedProfiles;

    alerts = getState().alerts.alerts;

    expect(alerts.length).toBe(1);
    expect(inboundTrackedProfiles.profiles.get(customUser.id)).not.toBe(null);
  });
});
