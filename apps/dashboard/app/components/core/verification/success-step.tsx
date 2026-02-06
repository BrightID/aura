"use client"

import { Button } from "@/components/ui/button"
import { LevelBadge } from "./level-badge"
import type { VerificationLevel } from "./types"

interface SuccessStepProps {
  appName: string
  level: VerificationLevel
  onContinue: () => void
}

export function SuccessStep({ appName, level, onContinue }: SuccessStepProps) {
  return (
    <div className="text-center space-y-5 py-2">
      {/* Success Animation */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full bg-aura-success/20 animate-ping" />
        <div className="relative w-full h-full rounded-full bg-aura-success/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-aura-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Verification Successful
        </h2>
        <p className="text-muted-foreground">{`You're verified to use ${appName}`}</p>
      </div>

      {/* Level Display */}
      <div className="inline-flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-xl">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Your Level
        </span>
        <LevelBadge level={level} size="lg" />
      </div>

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full" size="lg">
        Continue to {appName}
      </Button>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground">
        This verification can be used across multiple apps
      </p>
    </div>
  )
}
