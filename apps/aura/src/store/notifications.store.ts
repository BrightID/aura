import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { EvaluationCategory } from '@/types/dashboard';
import type { AuraImpactRaw } from '@/types/aura';
import type { AuraNodeBrightIdConnection } from '@/types';
import { getAuraVerification } from '@/hooks/useParseBrightIdVerificationData';
import { queryClient } from '@/lib/queryClient';
import { brightIdProfileQueryOptions, inboundConnectionsQueryOptions, outboundConnectionsQueryOptions } from '@/hooks/queries/connections';

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

export interface NotificationsState {
  inboundTrackedProfiles: Record<string, InboundProfile>;
  outboundTrackedProfiles: Record<string, OutboundProfile>;
  inboundLoading: boolean;
  outboundLoading: boolean;
  activityLogs: NotificationObject[];
  alerts: NotificationObject[];
  isInitialized: boolean;
  lastFetch: number | null;
}

interface NotificationsActions {
  toggleInboundFetchings: (loading: boolean) => void;
  toggleOutboundFetchings: (loading: boolean) => void;
  resetOnMountStates: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateNewNotifications: (notifications: NotificationObject[]) => void;
  updateInboundTrackedState: (inbounds: Record<string, InboundProfile>) => void;
  updateOutboundTrackedState: (outbounds: Record<string, OutboundProfile>) => void;
  updateLastFetch: () => void;
  initializeBaseTrackedStates: (data: {
    inbounds: Record<string, InboundProfile>;
    outbounds: Record<string, OutboundProfile>;
  }) => void;
  triggerNotificationFetch: (brightId: string) => Promise<void>;
  reset: () => void;
}

const initialState: NotificationsState = {
  inboundTrackedProfiles: {},
  outboundTrackedProfiles: {},
  inboundLoading: false,
  outboundLoading: false,
  activityLogs: [],
  alerts: [],
  isInitialized: false,
  lastFetch: null,
};

export const useNotificationsStore = create<NotificationsState & NotificationsActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      toggleInboundFetchings: (inboundLoading) => set({ inboundLoading }),
      toggleOutboundFetchings: (outboundLoading) => set({ outboundLoading }),
      resetOnMountStates: () => set({ inboundLoading: false, outboundLoading: false }),
      markAsRead: (id) =>
        set((s) => ({
          alerts: s.alerts.map((n) => (n.id === id ? { ...n, viewed: true } : n)),
        })),
      markAllAsRead: () =>
        set((s) => ({ alerts: s.alerts.map((n) => ({ ...n, viewed: true })) })),
      updateNewNotifications: (notifications) =>
        set((s) => ({ alerts: [...s.alerts, ...notifications] })),
      updateInboundTrackedState: (inboundTrackedProfiles) =>
        set({ inboundTrackedProfiles }),
      updateOutboundTrackedState: (outboundTrackedProfiles) =>
        set({ outboundTrackedProfiles }),
      updateLastFetch: () => set({ lastFetch: Date.now() }),
      initializeBaseTrackedStates: ({ inbounds, outbounds }) =>
        set({ inboundTrackedProfiles: inbounds, outboundTrackedProfiles: outbounds, isInitialized: true }),
      triggerNotificationFetch: async (brightId) => {
        await Promise.all([
          updateInboundData(brightId),
          updateOutboundData(brightId),
        ]);
        get().updateLastFetch();
      },
      reset: () => set(initialState),
    }),
    {
      name: 'alerts',
      storage: createJSONStorage(() => localforage),
      partialize: (s) => ({
        inboundTrackedProfiles: s.inboundTrackedProfiles,
        outboundTrackedProfiles: s.outboundTrackedProfiles,
        alerts: s.alerts,
        activityLogs: s.activityLogs,
        lastFetch: s.lastFetch,
        isInitialized: s.isInitialized,
      }),
    },
  ),
);

export const categoriesToExplore = [
  EvaluationCategory.SUBJECT,
  EvaluationCategory.PLAYER,
  EvaluationCategory.TRAINER,
  EvaluationCategory.MANAGER,
];

async function updateInboundData(brightId: string) {
  const store = useNotificationsStore.getState();
  if (store.inboundLoading) return;

  store.toggleInboundFetchings(true);

  const [data, profileData] = await Promise.all([
    queryClient.fetchQuery(inboundConnectionsQueryOptions(brightId)),
    queryClient.fetchQuery(brightIdProfileQueryOptions(brightId)),
  ]);

  const inbounds = { ...store.inboundTrackedProfiles };
  const previousFetchTime = new Date(store.lastFetch ?? 0);
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
    const previousState = inbounds[`${brightId}-${category}`];
    const userVerification = getAuraVerification(profileData?.verifications, category);

    if (previousState) {
      if (
        userVerification?.level &&
        previousState.level &&
        Math.abs(previousState.level - userVerification.level) >= ALERT_THRESHOLDS.LEVEL_CHANGE
      ) {
        newNotifications.push(
          createUserLevelChangeNotification(category, userVerification.level, previousState.level, brightId, 'inbound'),
        );
      }

      if (
        userVerification?.score &&
        previousState.score &&
        Math.abs((userVerification.score / previousState.score) * 100 - 100) >= ALERT_THRESHOLDS.MIN_SCORE_CHANGE_PERCENT
      ) {
        newNotifications.push(
          createUserScoreChangeNotification(category, userVerification.score, previousState.score, brightId, 'inbound'),
        );
      }
    }

    inbounds[`${brightId}-${category}`] = {
      category,
      confidence: 0,
      id: brightId,
      lastUpdated: Date.now(),
      level: userVerification?.level,
      score: userVerification?.score,
    };

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
            .auraEvaluations!.filter((e) => e.category === category)
            .map((evaluation) => ({ ...evaluation, id: item.id })),
        ) ?? []
    ).flat();

    for (const evaluation of evaluations) {
      if (previousFetchTime.getTime() < evaluation.modified) {
        newNotifications.push(
          createUserInboundNotification(
            brightId,
            category,
            brightIdConnectionsMap[evaluation.id],
            historyScore,
            historyScore + (verificationsMap[evaluation.id]?.impact ?? 0),
            evaluation.modified,
          ),
        );
      }
      inbounds[`${evaluation.id}-${category}`] = {
        category,
        confidence: evaluation.confidence,
        id: evaluation.id,
        lastUpdated: evaluation.modified,
      };
      historyScore += verificationsMap[evaluation.id]?.impact ?? 0;
    }
  }

  if (newNotifications.length) {
    useNotificationsStore.getState().updateNewNotifications(newNotifications);
  }

  useNotificationsStore.getState().updateInboundTrackedState(inbounds);
  useNotificationsStore.getState().toggleOutboundFetchings(false);
}

async function updateOutboundData(brightId: string) {
  const store = useNotificationsStore.getState();
  if (store.outboundLoading) return;

  const data = await queryClient.fetchQuery(outboundConnectionsQueryOptions(brightId));
  const outbounds = { ...store.outboundTrackedProfiles };
  const newNotifications: NotificationObject[] = [];

  for (const outbound of data ?? []) {
    const categoriesToExploreForOutbound = new Set(
      outbound.auraEvaluations?.map((item) => item.category),
    );

    for (const category of categoriesToExploreForOutbound) {
      const verification = getAuraVerification(outbound.verifications, category);
      const queryKey = `${outbound.id}-${category}`;
      const previousState = outbounds[queryKey];

      if (!previousState) {
        outbounds[queryKey] = {
          category,
          confidence: 0,
          id: outbound.id,
          lastUpdated: Date.now(),
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
        };
        continue;
      }

      if (
        verification?.level &&
        Math.abs(previousState.level - verification.level) >= ALERT_THRESHOLDS.LEVEL_CHANGE
      ) {
        newNotifications.push(
          createUserLevelChangeNotification(category, verification.level, previousState.level, outbound.id),
        );
      }

      if (
        verification?.score &&
        Math.abs((verification.score / previousState.score) * 100 - 100) >= ALERT_THRESHOLDS.MIN_SCORE_CHANGE_PERCENT
      ) {
        newNotifications.push(
          createUserScoreChangeNotification(category, verification.score, previousState.score, outbound.id),
        );
      }

      for (const impact of verification?.impacts ?? []) {
        if (impact.evaluator === brightId) continue;
        if (
          previousState.evaluators[impact.evaluator]?.id &&
          previousState.evaluators[impact.evaluator].confidence === impact.confidence
        ) {
          continue;
        }
        newNotifications.push(createUserOutboundEvaluationNotification(impact, outbound.id, category, impact.modified));
      }

      outbounds[queryKey] = {
        category,
        confidence: 0,
        id: outbound.id,
        lastUpdated: Date.now(),
        level: verification?.level ?? 0,
        score: verification?.score ?? 0,
        evaluators:
          verification?.impacts.reduce(
            (prev, curr) => {
              prev[curr.evaluator] = {
                category,
                confidence: curr.confidence,
                id: curr.evaluator,
                lastUpdated: Date.now(),
              };
              return prev;
            },
            {} as Record<string, InboundProfile>,
          ) ?? {},
      };
    }
  }

  if (newNotifications.length) {
    useNotificationsStore.getState().updateNewNotifications(newNotifications);
  }

  useNotificationsStore.getState().updateOutboundTrackedState(outbounds);
  useNotificationsStore.getState().toggleInboundFetchings(false);
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
    type: newScore > previousScore ? NotificationType.ScoreIncrease : NotificationType.ScoreDecrease,
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
    type: newLevel > previousLevel ? NotificationType.LevelIncrease : NotificationType.LevelDecrease,
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
    extraPayloads: { rating: impact.confidence },
  };
}

export function createUserInboundNotification(
  fromBrightId: string,
  category: EvaluationCategory,
  connection: AuraNodeBrightIdConnection,
  previousScore: number,
  newScore: number,
  timestamp: number,
): NotificationObject {
  return {
    id: `${fromBrightId}-inbound-evaluation-${Date.now()}`,
    category,
    description: '',
    from: connection.id,
    to: fromBrightId,
    triggeredFrom: 'inbound',
    previousState: previousScore,
    newState: newScore,
    type: newScore < previousScore ? NotificationType.ScoreDecrease : NotificationType.ScoreIncrease,
    timestamp,
    viewed: false,
  };
}
