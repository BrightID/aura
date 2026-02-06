import { AppDispatch, configureAppStore, RootState } from '@/store';
import {
  OutboundProfile,
  updateInboundData,
  updateOutboundData,
} from '@/store/notifications';
import {
  createSubjectCategory,
  generateRandomBrightId,
  generateRandomBrightIdConnectionBackup,
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
import { makeMockOutboundInterceptor } from '../../utils/api/server';
import { EnhancedStore } from '@reduxjs/toolkit';

const createMockedData = () => {
  const mockedOutboundData = {
    data: { connections: [] as BrightIdBackupConnection[] },
  };

  const connection = generateRandomBrightIdConnectionBackup('already known');
  mockedOutboundData.data.connections.push(
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

  customUser.verifications[0].domains![0].categories.push(
    createSubjectCategory(
      EvaluationCategory.SUBJECT,
      [
        {
          confidence: -4,
          evaluator: generateRandomBrightId(),
          evaluatorName: '',
          impact: -40000,
          modified: Date.now(),
          score: -40000,
          level: 2,
        },
      ],
      -1,
    ),
  );

  mockedOutboundData.data.connections.push(customUser);

  // const domains =
  //   mockedOutboundData.data.connections[0].verifications![0].domains!;

  // domains[0].categories.push(
  //   createSubjectCategory(
  //     EvaluationCategory.SUBJECT,
  //     [
  //       generateEvaluationImpact(
  //         TEST_BRIGHT_ID,
  //         Math.floor(Math.random() * 100000),
  //         4,
  //         Math.floor(Math.random() * 100000),
  //       ),
  //     ],
  //     1,
  //   ),
  // );

  return { mockedOutboundData, customUser };
};

const { mockedOutboundData, customUser } = createMockedData();

export const restHandlers = [
  makeMockOutboundInterceptor(mockedOutboundData, TEST_BRIGHT_ID),
];

const server = setupServer(...restHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

const outboundTrackedProfiles = new Map<string, OutboundProfile>();

outboundTrackedProfiles.set(`${customUser.id}-${EvaluationCategory.SUBJECT}`, {
  category: EvaluationCategory.SUBJECT,
  confidence: 1,
  evaluators: {},
  id: customUser.id,
  lastUpdated: Date.now() - 5 * 60000,
  level: -1,
  score: -40000,
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
      profiles: new Map(),
    },
    outboundTrackedProfiles: {
      isLoading: false,
      previousFetch: Date.now() - 5 * 600000,
      profiles: outboundTrackedProfiles,
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

describe('outbound notification generations', () => {
  let store: EnhancedStore;
  let dispatch: AppDispatch;
  let getState: () => RootState;

  beforeEach(() => {
    store = createMockStore();
    dispatch = store.dispatch;
    getState = store.getState;
    vi.clearAllMocks();
  });

  it('Should generate a notification when someone evaluates the evaluated user', async () => {
    await updateOutboundData(getState, dispatch, TEST_BRIGHT_ID);

    const { outboundTrackedProfiles, alerts } = getState().alerts;
    console.log(alerts);

    expect(alerts.length).toBe(1);
  });

  it('Should generate nothing if the there is no new changes', async () => {
    await updateOutboundData(getState, dispatch, TEST_BRIGHT_ID);

    let { outboundTrackedProfiles, alerts } = getState().alerts;

    expect(alerts.length).toBe(1);
    // expect(outboundTrackedProfiles.profiles.get(customUser.id)).not.toBe(null);

    await updateOutboundData(getState, dispatch, TEST_BRIGHT_ID);

    outboundTrackedProfiles = getState().alerts.outboundTrackedProfiles;

    alerts = getState().alerts.alerts;

    expect(alerts.length).toBe(1);
    // expect(inboundTrackedProfiles.profiles.get(customUser.id)).not.toBe(null);
  });
});
