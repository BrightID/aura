import { useEffect, useRef } from "react"
import type { FrameTheme } from "./types"
import type { AuraPreviewFrame } from "@aura/widgets"

// Side-effect: registers <aura-preview-frame> as a custom element
import "@aura/widgets/preview-frame"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "aura-preview-frame": React.HTMLAttributes<HTMLElement>
    }
  }
}

const THEME_CLASSES: Record<FrameTheme, string> = {
  dark: "",
  light: "aura-theme-light",
  emerald: "aura-theme-emerald",
  ocean: "aura-theme-ocean",
  sunset: "aura-theme-sunset",
}

interface Props {
  appName: string
  appDescription: string
  appLogo?: string
  requiredLevel: 1 | 2 | 3
  isConnected: boolean
  currentLevel: 0 | 1 | 2 | 3
  auraScore?: number
  evaluationsReceived?: number
  evaluationsNeeded?: number
  score?: number
  scoreNeeded?: number
  userName?: string
  userAvatar?: string
  testMode?: boolean
  theme?: FrameTheme
}

export function WidgetPreviewFrame({
  theme = "dark",
  appName,
  appDescription,
  appLogo,
  requiredLevel,
  isConnected,
  currentLevel,
  auraScore = 0,
  evaluationsReceived = 0,
  evaluationsNeeded = 3,
  score = 0,
  scoreNeeded = 100,
  userName = "Aura User",
  userAvatar = "",
  testMode = false,
}: Props) {
  const ref = useRef<AuraPreviewFrame>(null)

  // Set Lit element properties via ref (bypasses React's attribute-only path)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.appName = appName
    el.appDescription = appDescription
    el.appLogo = appLogo ?? ""
    el.requiredLevel = requiredLevel
    el.isConnected = isConnected
    el.currentLevel = currentLevel
    el.auraScore = auraScore
    el.evaluationsReceived = evaluationsReceived
    el.evaluationsNeeded = evaluationsNeeded
    el.score = score
    el.scoreNeeded = scoreNeeded
    el.userName = userName
    el.userAvatar = userAvatar
    el.testMode = testMode
  }, [
    appName, appDescription, appLogo, requiredLevel,
    isConnected, currentLevel, auraScore,
    evaluationsReceived, evaluationsNeeded,
    score, scoreNeeded, userName, userAvatar, testMode,
  ])

  return (
    <div className={THEME_CLASSES[theme]}>
      {/* @ts-expect-error – ref on custom element */}
      <aura-preview-frame ref={ref} />
    </div>
  )
}
