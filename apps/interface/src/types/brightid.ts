import type { EvaluationCategory } from '@/utils/aura.js'

interface Impact {
  evaluator: string
  score: number
  confidence: number
  impact: number
  level?: number
}

export interface Category {
  name: string
  score: number
  level: number
  impacts: Impact[]
}

export interface Domain {
  name: string
  categories: Category[]
}

export interface Verification {
  name: string
  block: number
  timestamp: number
  domains?: Domain[]
  rank?: number
  connected?: string[]
  communities?: string[]
  reported?: string[]
  hash?: string
  linksNum?: number
  confirmedScore?: number
  score?: number
  directReports?: Record<string, any>
  indirectReports?: Record<string, any>
  reportedConnections?: Record<string, any>
  releaseTime?: number
}

interface RecoveryConnection {
  id: string
  isActive: boolean
  activeBefore: number
  activeAfter: number
}

export interface Profile {
  id: string
  sponsored: boolean
  verifications: Verification[]
  recoveryConnections: RecoveryConnection[]
  connectionsNum: number
  groupsNum: number
  reports: string[]
  createdAt: number
  signingKeys: string[]
  requiredRecoveryNum: number
}

export interface BrightID {
  data: Profile
}

export enum EvaluationValue {
  POSITIVE = 'positive',
  NEGATIVE = 'negative'
}

export type ConnectionLevel =
  | 'reported'
  | 'suspicious'
  | 'just met'
  | 'already known'
  | 'recovery'
  | 'aura only'

export type BrightIdConnection = {
  id: string
  level: ConnectionLevel
  reportReason: string | null
  timestamp: number
}

export type AuraEvaluation = {
  evaluation: EvaluationValue
  confidence: number
  domain: 'BrightID'
  category: EvaluationCategory
  modified: number
}

export type AuraNodeBrightIdConnection = BrightIdConnection & {
  auraEvaluations?: AuraEvaluation[]
  verifications: Verification[]
}
