import { EvaluationCategory } from '@/types/dashboard';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '..';
import { connectionsApi } from '../api/connections';
import { AuraNodeBrightIdConnection } from '@/types';
import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import { profileApi } from '../api/profile';
import { AuraImpactRaw } from '@/api/auranode.service';

export const ALERT_THRESHOLDS = {
  LEVEL_CHANGE: 1,
  SCORE_CHANGE_PERCENTAGE: 10,
  MIN_SCORE_CHANGE_PERCENT: 35,
};

export interface InboundProfile {
  id: string;
  confidence: number;
  category: EvaluationCategory;
  lastUpdated: number;
  level?: number;
  score?: number;
}

export interface OutboundProfile extends InboundProfile {
  evaluators: Record<string, InboundProfile>;
  score: number;
  level: number;
}

export interface InboundTrackedProfiles {
  isLoading: boolean;
  profiles: Map<string, InboundProfile>;
  previousFetch: number;
}

export interface OutboundTrackedProfiles extends InboundTrackedProfiles {
  profiles: Map<string, OutboundProfile>;
}

export const categoriesToExplore = [
  EvaluationCategory.SUBJECT,
  EvaluationCategory.PLAYER,
  EvaluationCategory.TRAINER,
  EvaluationCategory.MANAGER,
];

export async function triggerNotificationFetch(
  getState: () => unknown,
  dispatch: AppDispatch,
  brightId: string,
) {
  await Promise.all([
    updateInboundData(getState, dispatch, brightId),
    updateOutboundData(getState, dispatch, brightId),
  ]);
  dispatch(updateLastFetch());
}

export async function updateInboundData(
  getState: () => unknown,
  dispatch: AppDispatch,
  brightId: string,
) {
  const state = getState() as RootState;

  if (state.alerts.inboundTrackedProfiles.isLoading) return;

  dispatch(toggleInboundFetchings(true));

  const { data } = await dispatch(
    connectionsApi.endpoints.getInboundConnections.initiate(
      {
        id: brightId,
      },
      { forceRefetch: true },
    ),
  );

  console.log({ data });

  const inbounds: Map<string, InboundProfile> = state.alerts
    .inboundTrackedProfiles.profiles.size
    ? new Map(state.alerts.inboundTrackedProfiles.profiles)
    : new Map();

  const profileFetch = await dispatch(
    profileApi.endpoints.getBrightIDProfile.initiate(brightId),
  );

  const previousFetchTime = new Date(
    state.alerts.inboundTrackedProfiles.previousFetch,
  );

  const newNotifications: NotificationObject[] = [];

  const brightIdConnectionsMap =
    data?.reduce(
      (prev, item) => {
        prev[item.id] = item;
        return prev;
      },
      {} as Record<string, AuraNodeBrightIdConnection>,
    ) ?? {};

  for (const category of categoriesToExplore) {
    let historyScore = 0;

    const previousState = inbounds.get(`${brightId}-${category}`);

    const userVerification = getAuraVerification(
      profileFetch.data?.verifications,
      category,
    );

    if (previousState) {
      if (
        userVerification?.level &&
        previousState.level &&
        Math.abs(previousState.level! - userVerification.level) >=
          ALERT_THRESHOLDS.LEVEL_CHANGE
      ) {
        newNotifications.push(
          createUserLevelChangeNotification(
            category,
            userVerification?.level,
            previousState.level,
            brightId,
            'inbound',
          ),
        );
      }

      if (
        userVerification?.score &&
        previousState.score &&
        Math.abs((userVerification.score / previousState.score!) * 100 - 100) >=
          ALERT_THRESHOLDS.MIN_SCORE_CHANGE_PERCENT
      ) {
        newNotifications.push(
          createUserScoreChangeNotification(
            category,
            userVerification.score,
            previousState.score,
            brightId,
            'inbound',
          ),
        );
      }
    }

    inbounds.set(`${brightId}-${category}`, {
      category,
      confidence: 0,
      id: brightId,
      lastUpdated: Date.now(),
      level: userVerification?.level,
      score: userVerification?.score,
    });

    const verificationsMap =
      userVerification?.impacts.reduce(
        (prev, curr) => {
          prev[curr.evaluator] = curr;

          return prev;
        },
        {} as Record<string, AuraImpactRaw>,
      ) ?? {};

    const evaluations = (
      data
        ?.filter((item) => item.auraEvaluations?.length)
        .map((item) =>
          item
            .auraEvaluations!.filter((item) => item.category === category)
            .map((evaluation) => ({ ...evaluation, id: item.id })),
        ) ?? []
    ).flat();

    for (const evaluation of evaluations) {
      if (previousFetchTime.getTime() < evaluation.modified) {
        newNotifications.push(
          createUserInboudNotification(
            brightId,
            category,
            brightIdConnectionsMap[evaluation.id],
            historyScore,
            historyScore + (verificationsMap[evaluation.id].impact ?? 0),
            evaluation.modified,
          ),
        );
      }
      inbounds.set(`${evaluation.id}-${category}`, {
        category,
        confidence: evaluation.confidence,
        id: evaluation.id,
        lastUpdated: evaluation.modified,
      });

      historyScore += verificationsMap[evaluation.id].impact ?? 0;
    }
  }

  if (newNotifications.length) {
    dispatch(updateNewNotifications({ notifications: newNotifications }));
  }

  dispatch(updateInboundTrackedState({ inbounds }));
  dispatch(toggleOutboundFetchings(false));
}

export async function updateOutboundData(
  getState: () => unknown,
  dispatch: AppDispatch,
  brightId: string,
) {
  const state = getState() as RootState;
  if (state.alerts.outboundTrackedProfiles.isLoading) return;

  const { data } = await dispatch(
    connectionsApi.endpoints.getOutboundConnections.initiate(
      {
        id: brightId,
      },
      { forceRefetch: true },
    ),
  );

  const outbounds = state.alerts.outboundTrackedProfiles.profiles.size
    ? new Map(state.alerts.outboundTrackedProfiles.profiles)
    : new Map();

  const newNotifications: NotificationObject[] = [];

  for (const outbound of data ?? []) {
    const categoriesToExplore = new Set(
      outbound.auraEvaluations?.map((item) => item.category),
    );

    for (const category of categoriesToExplore) {
      const verification = getAuraVerification(
        outbound.verifications,
        category,
      );

      const queryKey = `${outbound.id}-${category}`;

      const previousState = outbounds.get(queryKey);

      if (!previousState) {
        outbounds.set(queryKey, {
          category,
          confidence: 0,
          id: outbound.id,
          lastUpdated: new Date().getTime(),
          level: verification?.level ?? 0,
          score: verification?.score ?? 0,
          evaluators:
            verification?.impacts.reduce(
              (prev, curr) => {
                prev[curr.evaluator] = {
                  category,
                  confidence: curr.confidence,
                  id: curr.evaluator,
                  lastUpdated: curr.modified,
                };

                return prev;
              },
              {} as Record<string, InboundProfile>,
            ) ?? {},
        });
        continue;
      }

      if (
        verification?.level &&
        Math.abs(previousState.level - verification.level) >=
          ALERT_THRESHOLDS.LEVEL_CHANGE
      ) {
        newNotifications.push(
          createUserLevelChangeNotification(
            category,
            verification?.level,
            previousState.level,
            outbound.id,
          ),
        );
      }

      if (
        verification?.score &&
        Math.abs((verification.score / previousState.score) * 100 - 100) >=
          ALERT_THRESHOLDS.MIN_SCORE_CHANGE_PERCENT
      ) {
        newNotifications.push(
          createUserScoreChangeNotification(
            category,
            verification.score,
            previousState.score,
            outbound.id,
          ),
        );
      }

      for (const impact of verification?.impacts ?? []) {
        if (impact.evaluator === brightId) continue;

        if (
          previousState.evaluators[impact.evaluator]?.id &&
          previousState.evaluators[impact.evaluator].confidence ===
            impact.confidence
        ) {
        } else {
          newNotifications.push(
            createUserOutboundEvaluationNotification(
              impact,
              outbound.id,
              category,
              impact.modified,
            ),
          );
        }
      }

      outbounds.set(queryKey, {
        category,
        confidence: 0,
        id: outbound.id,
        lastUpdated: new Date().getTime(),
        level: verification?.level ?? 0,
        score: verification?.score ?? 0,
        evaluators:
          verification?.impacts.reduce(
            (prev, curr) => {
              prev[curr.evaluator] = {
                category,
                confidence: curr.confidence,
                id: curr.evaluator,
                lastUpdated: new Date().getTime(),
              };

              return prev;
            },
            {} as Record<string, InboundProfile>,
          ) ?? {},
      });
    }
  }

  if (newNotifications.length) {
    dispatch(updateNewNotifications({ notifications: newNotifications }));
  }

  dispatch(updateOutboundTrackedState({ outbounds }));
  dispatch(toggleInboundFetchings(false));
}

export function createUserScoreChangeNotification(
  category: EvaluationCategory,
  newScore: number,
  previousScore: number,
  subjectId: string,
  triggeredFrom: 'inbound' | 'outbound' = 'outbound',
): NotificationObject {
  return {
    id: `${subjectId}-score-${Date.now()}`,
    category,
    description: '',
    from: subjectId,
    newState: newScore,
    previousState: previousScore,
    timestamp: Date.now(),
    to: null,
    triggeredFrom,
    type:
      newScore > previousScore
        ? NotificationType.ScoreIncrease
        : NotificationType.ScoreDecrease,
    viewed: false,
  };
}

export function createUserLevelChangeNotification(
  category: EvaluationCategory,
  newLevel: number,
  previousLevel: number,
  subjectId: string,
  triggeredFrom: 'inbound' | 'outbound' = 'outbound',
): NotificationObject {
  return {
    id: `${subjectId}-level-${Date.now()}`,
    category,
    description: '',
    from: subjectId,
    newState: newLevel,
    previousState: previousLevel,
    timestamp: Date.now(),
    to: null,
    triggeredFrom,
    type:
      newLevel > previousLevel
        ? NotificationType.LevelIncrease
        : NotificationType.LevelDecrease,
  };
}

export function createUserOutboundEvaluationNotification(
  impact: AuraImpactRaw,
  subjectId: string,
  category: EvaluationCategory,
  timestamp: number,
): NotificationObject {
  return {
    id: `${subjectId}-outbound-evaluation-${Date.now()}`,
    category,
    from: impact.evaluator,
    to: subjectId,
    description: '',
    newState: impact.impact,
    previousState: null,
    timestamp,
    triggeredFrom: 'outbound',
    type: NotificationType.Evaluation,
    viewed: false,
    extraPayloads: {
      rating: impact.confidence,
    },
  };
}

export function createUserInboudNotification(
  fromBrightId: string,
  category: EvaluationCategory,
  connection: AuraNodeBrightIdConnection,
  previousScore: number,
  newScore: number,
  timestamp: number,
) {
  return {
    id: `${fromBrightId}-inbound-evaluation-${Date.now()}`,
    category,
    description: '',
    from: connection.id,
    to: fromBrightId,
    triggeredFrom: 'inbound',
    previousState: previousScore,
    newState: newScore,
    type:
      newScore < previousScore
        ? NotificationType.ScoreDecrease
        : NotificationType.ScoreIncrease,
    timestamp,
  } as NotificationObject;
}

export enum NotificationType {
  Evaluation,
  ChangeEvaluation,
  ScoreIncrease,
  ScoreDecrease,
  LevelIncrease,
  LevelDecrease,
}

export interface NotificationObject {
  id: string;
  type: NotificationType;
  category: EvaluationCategory;
  from: string;
  to: string | null;
  description: string;
  triggeredFrom: 'inbound' | 'outbound';
  previousState: unknown;
  newState: unknown;
  timestamp: number;
  extraPayloads?: Record<string, unknown>;
  viewed?: boolean;
}

export const notificationsSlice = createSlice({
  reducerPath: 'alerts',
  initialState: {
    inboundTrackedProfiles: {
      isLoading: false,
      profiles: new Map(),
    } as InboundTrackedProfiles,
    outboundTrackedProfiles: {
      isLoading: false,
      profiles: new Map(),
    } as OutboundTrackedProfiles,
    activityLogs: [] as NotificationObject[],
    alerts: [] as NotificationObject[],
    isInitialized: false,
    lastFetch: null as number | null,
  },
  name: 'alertsSlice',
  reducers: {
    toggleInboundFetchings(state, isLoading: PayloadAction<boolean>) {
      state.inboundTrackedProfiles.isLoading = isLoading.payload;
    },
    toggleOutboundFetchings(state, isLoading: PayloadAction<boolean>) {
      state.outboundTrackedProfiles.isLoading = isLoading.payload;
    },
    resetOnMountStates(state) {
      state.inboundTrackedProfiles.isLoading = false;

      state.outboundTrackedProfiles.isLoading = false;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.alerts.find(
        (item) => item.id === action.payload,
      );
      if (notification) {
        notification.viewed = true;
      }
    },
    markAllAsRead: (state) => {
      state.alerts.forEach((notification) => {
        notification.viewed = true;
      });
    },
    initializeBaseTrackedStates(
      state,
      payload: PayloadAction<{
        inbounds: Map<string, InboundProfile>;
        outbounds: OutboundTrackedProfiles;
      }>,
    ) {
      state.inboundTrackedProfiles.profiles = payload.payload.inbounds;

      state.outboundTrackedProfiles = payload.payload.outbounds;
      state.isInitialized = true;
    },
    updateNewNotifications(
      state,
      payload: PayloadAction<{
        notifications: NotificationObject[];
      }>,
    ) {
      state.alerts.push(...payload.payload.notifications);
    },
    updateInboundTrackedState(
      state,
      payload: PayloadAction<{
        inbounds: Map<string, InboundProfile>;
      }>,
    ) {
      state.inboundTrackedProfiles.profiles = payload.payload.inbounds;
    },
    updateLastFetch(state) {
      state.lastFetch = Date.now();
    },
    updateOutboundTrackedState(
      state,
      payload: PayloadAction<{
        outbounds: Map<string, OutboundProfile>;
      }>,
    ) {
      state.outboundTrackedProfiles.profiles = payload.payload.outbounds;
    },
  },
});

export const {
  initializeBaseTrackedStates,
  resetOnMountStates,
  toggleInboundFetchings,
  toggleOutboundFetchings,
  updateNewNotifications,
  updateInboundTrackedState,
  updateOutboundTrackedState,
  markAllAsRead,
  markAsRead,
  updateLastFetch,
} = notificationsSlice.actions;

export const alertsSelector = createSelector(
  (state: RootState) => state.alerts,
  (notifications) => notifications.alerts,
);

export const alertLoadingSelector = createSelector(
  (state: RootState) => state.alerts,
  (state) =>
    state.inboundTrackedProfiles.isLoading ||
    state.outboundTrackedProfiles.isLoading,
);

export const alertsLastFetchSelector = createSelector(
  (state: RootState) => state.alerts,
  (state) => state.lastFetch,
);
