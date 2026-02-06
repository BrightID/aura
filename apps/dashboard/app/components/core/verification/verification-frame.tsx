import { useState, useCallback, useEffect } from "react"
import { IntroStep } from "./intro-step"
import { ConnectStep } from "./connect"
import { ProgressStep } from "./progress-step"
import { SuccessStep } from "./success-step"
import { HowItWorks } from "./how-it-works"
import { FindPlayersStep } from "./find-players"
import type {
  AuraFrameConfig,
  FrameStep,
  UserVerificationStatus,
  FrameTheme,
} from "./types"
import { cn } from "@/lib/utils"

const themeStyles: Record<FrameTheme, string> = {
  dark: "",
  light: "aura-theme-light",
  emerald: "aura-theme-emerald",
  ocean: "aura-theme-ocean",
  sunset: "aura-theme-sunset",
}

interface ExtendedAuraFrameConfig extends AuraFrameConfig {
  externalUserStatus?: UserVerificationStatus
  onUserStatusChange?: (status: UserVerificationStatus) => void
}

export function AuraVerificationFrame({
  appName,
  appDescription,
  appLogo,
  requiredLevel,
  theme = "dark",
  testMode = false,
  onVerified,
  onClose,
  externalUserStatus,
  onUserStatusChange,
}: ExtendedAuraFrameConfig) {
  const [step, setStep] = useState<FrameStep>("intro")
  const [previousStep, setPreviousStep] = useState<FrameStep>("intro")
  const [internalUserStatus, setInternalUserStatus] =
    useState<UserVerificationStatus>({
      isConnected: false,
      currentLevel: 0,
      evaluationsReceived: 0,
      evaluationsNeeded: 3,
      score: 0,
      scoreNeeded: 100,
    })

  const userStatus = externalUserStatus || internalUserStatus
  const setUserStatus = (status: UserVerificationStatus) => {
    setInternalUserStatus(status)
    onUserStatusChange?.(status)
  }

  const goToStep = useCallback(
    (newStep: FrameStep) => {
      setPreviousStep(step)
      setStep(newStep)
    },
    [step]
  )

  const handleConnect = useCallback(
    (status: UserVerificationStatus) => {
      setUserStatus(status)
      if (status.currentLevel >= requiredLevel) {
        goToStep("success")
        onVerified?.(status.userId!, status.currentLevel as 1 | 2 | 3)
      } else {
        goToStep("progress")
      }
    },
    [requiredLevel, onVerified, goToStep]
  )

  const handleDisconnect = useCallback(() => {
    setUserStatus({
      isConnected: false,
      currentLevel: 0,
      evaluationsReceived: 0,
      evaluationsNeeded: 3,
      score: 0,
      scoreNeeded: 100,
    })
    goToStep("connect")
  }, [goToStep])

  const handleStartVerification = useCallback(() => {
    window.open(
      "https://brightid.gitbook.io/aura/getting-started/get-brightid",
      "_blank"
    )
  }, [])

  const handleContinue = useCallback(() => {
    onVerified?.(userStatus.userId!, userStatus.currentLevel as 1 | 2 | 3)
    onClose?.()
  }, [userStatus, onVerified, onClose])

  useEffect(() => {
    if (externalUserStatus?.isConnected && step !== "find-players") {
      if (externalUserStatus.currentLevel >= requiredLevel) {
        setStep("success")
      } else {
        setStep("progress")
      }
    }
  }, [externalUserStatus, requiredLevel, step])

  return (
    <div
      className={cn(
        "w-full max-w-[380px] bg-card rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-border relative",
        themeStyles[theme]
      )}
    >
      {testMode && (
        <div className="absolute top-3 -right-8 bg-aura-warning text-primary-foreground text-[10px] font-bold px-8 py-0.5 rotate-45 z-10 shadow-sm">
          TEST
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "p-5 transition-all duration-300",
          step === "how-it-works" && "bg-card"
        )}
      >
        {step === "intro" && (
          <IntroStep
            appName={appName}
            appDescription={appDescription}
            appLogo={appLogo}
            requiredLevel={requiredLevel}
            onContinue={() => goToStep("connect")}
            onHowItWorks={() => goToStep("how-it-works")}
          />
        )}

        {step === "connect" && (
          <ConnectStep
            onConnect={handleConnect}
            onHowItWorks={() => goToStep("how-it-works")}
          />
        )}

        {step === "progress" && (
          <ProgressStep
            status={userStatus}
            requiredLevel={requiredLevel}
            appName={appName}
            onStartVerification={handleStartVerification}
            onDisconnect={handleDisconnect}
            onFindPlayers={() => goToStep("find-players")}
          />
        )}

        {step === "success" && (
          <SuccessStep
            appName={appName}
            level={userStatus.currentLevel as 1 | 2 | 3}
            onContinue={handleContinue}
          />
        )}

        {step === "how-it-works" && (
          <HowItWorks onBack={() => setStep(previousStep)} />
        )}

        {step === "find-players" && (
          <FindPlayersStep
            userId={userStatus.userId}
            onBack={() => goToStep("progress")}
            onSelectPlayer={(playerId) => {
              console.log("Selected player:", playerId)
              // In production, this would open a connection/evaluation flow
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secured by Aura Network</span>
          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  )
}
