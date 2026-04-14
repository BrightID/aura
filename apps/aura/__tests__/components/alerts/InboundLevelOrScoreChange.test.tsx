import { AppDispatch, configureAppStore, RootState } from '@/store';
import {
  InboundProfile,
  NotificationType,
  updateInboundData,
} from '@/store/notifications';
import {
  findProfileCategory,
  generateRandomBrightIdConnectionBackup,
  mockedBrightIdProfileData,
  TEST_BRIGHT_ID,
  TEST_BRIGHT_PASSWORD,
} from '../../utils/api/profile';
import { EvaluationCategory, PreferredView } from '@/types/dashboard';
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

  const mockedProfileData = { ...mockedBrightIdProfileData };

  const subjectProfile = findProfileCategory(
    mockedBrightIdProfileData,
    'subject',
  );

  subjectProfile.level = -1;
  subjectProfile.score = -20000;

  return { mockedInboundData, mockedProfileData };
};

const { mockedInboundData, mockedProfileData } = createMockedData();

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

const inboundTrackedProfiles = new Map<string, InboundProfile>();

inboundTrackedProfiles.set(`${TEST_BRIGHT_ID}-${EvaluationCategory.SUBJECT}`, {
  category: EvaluationCategory.SUBJECT,
  confidence: 0,
  id: TEST_BRIGHT_ID,
  lastUpdated: Date.now(),
  level: 1,
  score: 500,
});

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
      profiles: inboundTrackedProfiles,
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

  it('Should generate a notification when score or level changes significantly', async () => {
    await updateInboundData(getState, dispatch, TEST_BRIGHT_ID);

    const { inboundTrackedProfiles, alerts } = getState().alerts;

    expect(alerts.length).toBe(2);

    const [levelNotificaiton, scoreNotification] = alerts;

    const trackedProfile = inboundTrackedProfiles.profiles.get(
      `${TEST_BRIGHT_ID}-${EvaluationCategory.SUBJECT}`,
    );

    expect(trackedProfile?.confidence).toBe(0);

    expect(trackedProfile?.score).toBe(-20000);

    expect(trackedProfile?.level).toBe(-1);

    expect(levelNotificaiton.type).toBe(NotificationType.LevelDecrease);
    expect(scoreNotification.type).toBe(NotificationType.ScoreDecrease);
  });
});
