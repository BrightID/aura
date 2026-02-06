import type { EvaluationCategory } from '@/utils/aura'

export interface Evaluator {
  id: string
  timestamp: number
  value: number
}

export interface TrackedCategoryState {
  score: number
  level: number
  evaluators: Evaluator[]
  explorivity: number
}

export interface TrackedProfileState {
  id: string
  categories: Record<EvaluationCategory, TrackedCategoryState>
  lastUpdated: number
}

export interface Notification {
  id: string
  title: string
  description: string
  link?: string
  icon?: string
  createdAt: number
  read: boolean
  profileId: string
  changeType: 'level' | 'score' | 'evaluation'
  evaluationCategory: EvaluationCategory
  viewed?: boolean
}

export type NotificationsState = {
  items: Notification[]
  trackedProfiles: Record<string, TrackedProfileState>
  lastFetched: number | null
  loading: boolean
  error: string | null
}
