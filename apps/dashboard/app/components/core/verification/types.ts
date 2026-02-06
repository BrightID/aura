export type VerificationLevel = 1 | 2 | 3

export type FrameTheme = "dark" | "light" | "emerald" | "ocean" | "sunset"

export interface AuraFrameConfig {
  appName: string
  appDescription: string
  appLogo?: string
  requiredLevel: VerificationLevel
  theme?: FrameTheme
  testMode?: boolean
  onVerified?: (userId: string, level: VerificationLevel) => void
  onClose?: () => void
}

export interface UserVerificationStatus {
  isConnected: boolean
  userId?: string
  currentLevel: VerificationLevel | 0
  evaluationsReceived: number
  evaluationsNeeded: number
  score: number
  scoreNeeded: number
}

export interface AuraPlayer {
  id: string
  name: string
  level: VerificationLevel
  avatar?: string
  isOnline?: boolean
  mutualConnections?: number
}

export type FrameStep =
  | "intro"
  | "connect"
  | "progress"
  | "success"
  | "how-it-works"
  | "find-players"
