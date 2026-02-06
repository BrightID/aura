import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuraLogo } from "./aura-logo"
import type { UserVerificationStatus } from "./types"

interface ConnectStepProps {
  onConnect: (status: UserVerificationStatus) => void
  onHowItWorks: () => void
}

export function ConnectStep({ onConnect, onHowItWorks }: ConnectStepProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectMethod, setConnectMethod] = useState<
    "brightid" | "passkey" | null
  >(null)

  const handleConnect = async (method: "brightid" | "passkey") => {
    setConnectMethod(method)
    setIsConnecting(true)

    // Simulate connection - in real implementation, this would:
    // 1. Open BrightID app or passkey flow
    // 2. Fetch user's verification status from Aura network
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock status - replace with actual Aura API call
    const mockStatus: UserVerificationStatus = {
      isConnected: true,
      userId: "aura_" + Math.random().toString(36).substring(7),
      currentLevel: 1,
      evaluationsReceived: 2,
      evaluationsNeeded: 3,
      score: 45,
      scoreNeeded: 100,
    }

    onConnect(mockStatus)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <AuraLogo className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-semibold text-lg text-foreground">
          Connect to Aura
        </h2>
        <p className="text-sm text-muted-foreground">
          Verify your unique humanity to continue
        </p>
      </div>

      {/* Connection Options */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full h-auto py-3 px-4 justify-start gap-3 bg-secondary/50 hover:bg-secondary border-border"
          onClick={() => handleConnect("brightid")}
          disabled={isConnecting}
        >
          <div className="w-9 h-9 rounded-lg bg-[#ed7a5c]/10 flex items-center justify-center flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-[#ed7a5c]"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-foreground text-sm">BrightID</div>
            <div className="text-xs text-muted-foreground">
              {isConnecting && connectMethod === "brightid"
                ? "Opening BrightID..."
                : "Connect with existing identity"}
            </div>
          </div>
          {isConnecting && connectMethod === "brightid" && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full h-auto py-3 px-4 justify-start gap-3 bg-secondary/50 hover:bg-secondary border-border"
          onClick={() => handleConnect("passkey")}
          disabled={isConnecting}
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-foreground text-sm">Passkey</div>
            <div className="text-xs text-muted-foreground">
              {isConnecting && connectMethod === "passkey"
                ? "Authenticating..."
                : "Create or use existing passkey"}
            </div>
          </div>
          {isConnecting && connectMethod === "passkey" && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </Button>
      </div>

      {/* Help Link */}
      <button
        onClick={onHowItWorks}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        What is Aura?
      </button>

      {/* Trust Indicators */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Decentralized
          </span>
          <span className="flex items-center gap-1">
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
            Privacy-First
          </span>
          <span className="flex items-center gap-1">
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
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
            Open Network
          </span>
        </div>
      </div>
    </div>
  )
}
