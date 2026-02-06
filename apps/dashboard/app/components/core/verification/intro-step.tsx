"use client"

import { Button } from "@/components/ui/button"
import { LevelBadge } from "./level-badge"
import { AuraLogo } from "./aura-logo"
import type { VerificationLevel } from "./types"

interface IntroStepProps {
  appName: string
  appDescription: string
  appLogo?: string
  requiredLevel: VerificationLevel
  onContinue: () => void
  onHowItWorks: () => void
}

const levelDescriptions = {
  1: "Basic verification for general access",
  2: "Enhanced verification for trusted features",
  3: "Premium verification for full access",
}

export function IntroStep({
  appName,
  appDescription,
  appLogo,
  requiredLevel,
  onContinue,
  onHowItWorks,
}: IntroStepProps) {
  return (
    <div className="space-y-5">
      {/* App Header */}
      <div className="flex items-start gap-3">
        {appLogo ? (
          <img
            src={appLogo || "/placeholder.svg"}
            alt={appName}
            className="w-12 h-12 rounded-xl object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {appName.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{appName}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {appDescription}
          </p>
        </div>
      </div>

      {/* Verification Requirement Card */}
      <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Required Verification
          </span>
          <LevelBadge level={requiredLevel} size="sm" />
        </div>
        <p className="text-sm text-foreground">
          {levelDescriptions[requiredLevel]}
        </p>
      </div>

      {/* What is Aura */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
        <div className="flex items-center gap-2">
          <AuraLogo className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Powered by Aura
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aura is a decentralized network that verifies your unique humanity
          without exposing personal information.
        </p>
        <button
          onClick={onHowItWorks}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Learn how it works
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* CTA */}
      <Button onClick={onContinue} className="w-full" size="lg">
        Verify with Aura
      </Button>

      {/* Trust Note */}
      <p className="text-xs text-center text-muted-foreground">
        Your identity stays private. {appName} only sees your verification
        level.
      </p>
    </div>
  )
}
