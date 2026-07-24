import type { EvaluationCategory, EvaluationValue } from "./evaluations"

export interface AuraImpactRaw {
  evaluator: string
  level?: number | null
  score: number | null
  confidence: number
  impact: number
  modified: number
}

export type Domain = {
  name: "BrightID"
  categories: {
    name: EvaluationCategory
    score: number
    level: number
    impacts: AuraImpactRaw[]
  }[]
}

export type Verifications = {
  name: string
  block: number
  timestamp: number
  domains?: Domain[]
}[]

export interface BrightIdProfile {
  createdAt: number
  verifications: Verifications
}

/** Connections + evaluations from the aura node. */
export type ConnectionLevel =
  | "reported"
  | "suspicious"
  | "just met"
  | "already known"
  | "recovery"
  | "aura only"

export type BrightIdConnection = {
  id: string
  level: ConnectionLevel
  reportReason: string | null
  timestamp: number
}

export type AuraEvaluation = {
  evaluation: EvaluationValue
  confidence: number
  domain: "BrightID"
  category: EvaluationCategory
  modified: number
  timestamp: number
}

export type AuraNodeBrightIdConnection = BrightIdConnection & {
  auraEvaluations?: AuraEvaluation[]
  verifications: Verifications
}

export type AuraNodeConnectionsResponse = {
  data: {
    connections: AuraNodeBrightIdConnection[]
  }
}

export type AuraRating = {
  id?: number
  toBrightId: string
  fromBrightId: string
  rating: string
  timestamp: number
  createdAt: string
  updatedAt: string
  category: EvaluationCategory
  isPending: boolean
  verifications?: Verifications
}

export type BrightIdBackupConnection = BrightIdConnection &
  Partial<{
    name: string
    connectionDate: number
    photo: { filename: string }
    status: "verified"
    notificationToken: string
    socialMedia: unknown[]
    verifications: Verifications
    incomingLevel: ConnectionLevel
  }>

export type AuraNodeBrightIdConnectionWithBackupData =
  AuraNodeBrightIdConnection & BrightIdBackupConnection

export type BrightIdBackup = {
  userData: {
    id: string
    name: string
    photo: { filename: string }
  }
  connections: BrightIdBackupConnection[]
  groups: unknown[]
}

export type BrightIdBackupWithAuraConnectionData = Omit<
  BrightIdBackup,
  "connections"
> & {
  connections: AuraNodeBrightIdConnectionWithBackupData[]
}
