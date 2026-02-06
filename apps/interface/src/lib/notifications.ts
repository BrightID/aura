import { queryClient } from '@/utils/apis'
import { localStorageSignal } from './state'
import { fetchInboundConnections } from '@/utils/apis/notifications'
import { EvaluationCategory, getAuraVerification } from '@/utils/aura'
import type {
  Evaluator,
  Notification,
  TrackedCategoryState,
  TrackedProfileState
} from '@/types/notifications'
import type { AuraNodeBrightIdConnection } from '@/types/brightid'

export const NOTIFICATION_THRESHOLDS = {
  LEVEL_CHANGE: 1, // Notify on any level change
  SCORE_CHANGE_PERCENTAGE: 10, // Notify on 10% score change
  MIN_SCORE_CHANGE: 50 // Minimum absolute score change to trigger notification
}

export const notificationItems = localStorageSignal<Notification[]>(
  'notifications',
  [] as Notification[],
  (value) => (value ? JSON.parse(value) : []),
  (value) => (value ? JSON.stringify(value) : '[]')
)

export const hasInitialized = localStorageSignal(
  'isNotificationInitialized',
  false,
  (value) => !!Number(value),
  (value) => (value ? '1' : '0')
)

export const trackedProfile = localStorageSignal<Record<string, TrackedProfileState>>(
  'trackedProfile',
  {} as Record<string, TrackedProfileState>,
  (value) => (value ? JSON.parse(value) : {}),
  (value) => (value ? JSON.stringify(value) : '{}')
)

export const lastFetched = localStorageSignal<null | Date>(
  'lastFetched',
  null,
  (value: string | null) => (value ? new Date(value) : null),
  (value: Date | null) => value?.toISOString() ?? null
)

const periodFetch = 2.5 * 60 * 1000

export const fetchNewNotifications = async (brightId: string) => {
  const lastFetchedDate = lastFetched.get()

  if (lastFetchedDate && Date.now() - lastFetchedDate.getTime() < periodFetch) {
    return
  }

  const res = await queryClient.ensureQueryData({
    queryKey: ['notifications', { since: lastFetchedDate }],
    queryFn: () => fetchInboundConnections(brightId)
  })

  res?.forEach((item) => {
    updateProfileState(item)
  })
}

const shouldNotifyOnChange = (
  changeType: 'level' | 'score' | 'evaluation',
  oldValue: number,
  newValue: number
): boolean => {
  switch (changeType) {
    case 'level':
      return Math.abs(newValue - oldValue) >= NOTIFICATION_THRESHOLDS.LEVEL_CHANGE
    case 'score':
      const percentageChange = Math.abs((newValue - oldValue) / oldValue) * 100
      const absoluteChange = Math.abs(newValue - oldValue)
      return (
        percentageChange >= NOTIFICATION_THRESHOLDS.SCORE_CHANGE_PERCENTAGE &&
        absoluteChange >= NOTIFICATION_THRESHOLDS.MIN_SCORE_CHANGE
      )
    case 'evaluation':
      return true // Always notify on evaluation changes
  }
}

// Helper function to generate notification from state change
const generateNotification = (
  profileId: string,
  changeType: 'level' | 'score' | 'evaluation',
  oldValue: number,
  newValue: number,
  explorivity: number,
  evaluationCategory: EvaluationCategory
): Notification => {
  const changeDescription =
    changeType === 'level'
      ? `Level ${newValue > oldValue ? 'increased' : 'decreased'} by ${Math.abs(
          newValue - oldValue
        )}`
      : changeType === 'score'
      ? `Score ${newValue > oldValue ? 'increased' : 'decreased'} by ${Math.abs(
          newValue - oldValue
        )} points`
      : `Evaluation changed from ${oldValue} to ${newValue}`

  const explorivyInfo = explorivity ? ` (Profile explorivity: ${explorivity.toFixed(1)}%)` : ''

  return {
    id: `${profileId}-${changeType}-${Date.now()}`,
    profileId,
    changeType,
    title: `Profile ${changeType} changed`,
    description: `${changeDescription}${explorivyInfo}`,
    createdAt: Date.now(),
    read: false,
    link: `/profile/${profileId}`,
    icon:
      changeType === 'level'
        ? newValue > oldValue
          ? 'level-up'
          : 'level-down'
        : changeType === 'score'
        ? newValue > oldValue
          ? 'trending-up'
          : 'trending-down'
        : 'evaluation',
    evaluationCategory
  }
}

export function updateProfileState(payload: AuraNodeBrightIdConnection) {
  const { id, verifications, auraEvaluations } = payload
  const oldProfiles = trackedProfile.get()
  const oldState = oldProfiles[id]
  const categories: EvaluationCategory[] = [
    EvaluationCategory.SUBJECT,
    EvaluationCategory.PLAYER,
    EvaluationCategory.TRAINER,
    EvaluationCategory.MANAGER
  ]

  const newCategories: Record<EvaluationCategory, TrackedCategoryState> = {
    [EvaluationCategory.SUBJECT]: {
      score: 0,
      level: 0,
      evaluators: [],
      explorivity: 0
    },
    [EvaluationCategory.PLAYER]: {
      score: 0,
      level: 0,
      evaluators: [],
      explorivity: 0
    },
    [EvaluationCategory.TRAINER]: {
      score: 0,
      level: 0,
      evaluators: [],
      explorivity: 0
    },
    [EvaluationCategory.MANAGER]: {
      score: 0,
      level: 0,
      evaluators: [],
      explorivity: 0
    }
  }

  const isInitialized = hasInitialized.get()

  hasInitialized.set(true)

  categories.forEach((cat) => {
    const data = getAuraVerification(verifications, cat)
    const score = data?.score || 0
    const level = data?.level || 0
    const evaluators: Evaluator[] = (data?.impacts || []).map((impact) => ({
      id: impact.evaluator,
      timestamp: Date.now(),
      value: impact.score || 0
    }))
    const uniqueEvaluators = new Set(evaluators.map((e) => e.id)).size
    const explorivity = evaluators.length > 0 ? (uniqueEvaluators / evaluators.length) * 100 : 0
    newCategories[cat] = { score, level, evaluators, explorivity }
  })

  let notifications: Notification[] = []

  categories.forEach((cat) => {
    const newCat = newCategories[cat]
    const oldCat = oldState?.categories?.[cat]
    if (oldCat) {
      // Level change
      if (
        newCat.level !== oldCat.level &&
        shouldNotifyOnChange('level', oldCat.level, newCat.level)
      ) {
        notifications.push(
          generateNotification(id, 'level', oldCat.level, newCat.level, newCat.explorivity, cat)
        )
      }
      // Score change
      if (
        newCat.score !== oldCat.score &&
        shouldNotifyOnChange('score', oldCat.score, newCat.score)
      ) {
        notifications.push(
          generateNotification(id, 'score', oldCat.score, newCat.score, newCat.explorivity, cat)
        )
      }
      // New evaluations (by evaluator id)
      const oldEvalIds = new Set(oldCat.evaluators.map((e) => e.id))
      newCat.evaluators.forEach((ev) => {
        if (!oldEvalIds.has(ev.id)) {
          notifications.push(
            generateNotification(id, 'evaluation', 0, ev.value, newCat.explorivity, cat)
          )
        }
      })
    } else if (isInitialized) {
      if (auraEvaluations?.length && auraEvaluations[0]?.category) {
        notifications.push(
          generateNotification(
            id,
            'evaluation',
            0,
            auraEvaluations[0].confidence,
            100,
            auraEvaluations[0].category
          )
        )
      }
    }
  })

  if (notifications.length > 0) {
    notificationItems.set([...notificationItems.get(), ...notifications])
  }

  trackedProfile.set({
    ...oldProfiles,
    [id]: {
      id,
      categories: newCategories,
      lastUpdated: Date.now()
    }
  })
}
