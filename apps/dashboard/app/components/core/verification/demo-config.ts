import type { FrameTheme, UserVerificationStatus, VerificationLevel } from "./types"

export interface DemoConfig {
  // Frame config
  appName: string
  appDescription: string
  appLogo?: string
  requiredLevel: VerificationLevel
  theme: FrameTheme
  testMode: boolean
  // Simulated user status
  isConnected: boolean
  userId: string
  currentLevel: 0 | 1 | 2 | 3
  evaluationsReceived: number
  evaluationsNeeded: number
  score: number
  scoreNeeded: number
}

export interface DemoAppPreset {
  label: string
  appName: string
  appDescription: string
  requiredLevel: VerificationLevel
}

export const DEMO_APP_PRESETS: DemoAppPreset[] = [
  {
    label: "Gitcoin Grants",
    appName: "Gitcoin Grants",
    appDescription:
      "Decentralized funding for open source projects. Verify to participate in funding rounds.",
    requiredLevel: 2,
  },
  {
    label: "DAO Governance",
    appName: "DAO Governance",
    appDescription:
      "Vote on community proposals and participate in decentralized governance.",
    requiredLevel: 1,
  },
  {
    label: "Premium Access",
    appName: "Premium Access",
    appDescription: "Unlock exclusive features with highest verification level.",
    requiredLevel: 3,
  },
]

export const DEMO_THEMES: { value: FrameTheme; label: string; preview: string }[] = [
  { value: "dark", label: "Dark", preview: "bg-[#1a1a2e]" },
  { value: "light", label: "Light", preview: "bg-[#f8fafc]" },
  { value: "emerald", label: "Emerald", preview: "bg-[#064e3b]" },
  { value: "ocean", label: "Ocean", preview: "bg-[#0c4a6e]" },
  { value: "sunset", label: "Sunset", preview: "bg-[#431407]" },
]

export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  appName: "My App",
  appDescription: "Verify your identity to access exclusive features.",
  requiredLevel: 2,
  theme: "dark",
  testMode: true,
  isConnected: true,
  userId: "aura_demo_user_123",
  currentLevel: 1,
  evaluationsReceived: 2,
  evaluationsNeeded: 5,
  score: 45,
  scoreNeeded: 100,
}

export function toUserStatus(config: DemoConfig): UserVerificationStatus {
  return {
    isConnected: config.isConnected,
    userId: config.userId,
    currentLevel: config.currentLevel,
    evaluationsReceived: config.evaluationsReceived,
    evaluationsNeeded: config.evaluationsNeeded,
    score: config.score,
    scoreNeeded: config.scoreNeeded,
  }
}
