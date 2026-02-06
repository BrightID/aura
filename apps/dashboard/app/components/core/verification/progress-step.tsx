"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LevelBadge, LevelRequirement } from "./level-badge"
import { ProgressIndicator } from "./progress-indicator"
import type { VerificationLevel, UserVerificationStatus } from "./types"

interface ProgressStepProps {
  status: UserVerificationStatus
  requiredLevel: VerificationLevel
  appName: string
  onStartVerification: () => void
  onDisconnect: () => void
  onFindPlayers: () => void
}

export function ProgressStep({
  status,
  requiredLevel,
  appName,
  onStartVerification,
  onDisconnect,
  onFindPlayers,
}: ProgressStepProps) {
  const isMet = status.currentLevel >= requiredLevel
  const needsMoreLevel = requiredLevel - status.currentLevel
  const [showTips, setShowTips] = useState(false)

  return (
    <div className="space-y-4">
      {/* User Status Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {status.userId?.slice(0, 12)}...
            </p>
            <LevelBadge level={status.currentLevel} size="sm" />
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Requirement Status */}
      <LevelRequirement
        required={requiredLevel}
        current={status.currentLevel}
      />

      {/* Progress or Success */}
      {!isMet ? (
        <>
          <ProgressIndicator status={status} requiredLevel={requiredLevel} />

          {/* Next Steps */}
          <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <svg
                className="w-4 h-4 text-aura-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {`Reach Level ${requiredLevel} to continue`}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {needsMoreLevel === 1
                ? "You need 1 more level. Get evaluated by people who know you to increase your score."
                : `You need ${needsMoreLevel} more levels. Complete evaluations and build your verification score.`}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onStartVerification}
                className="flex-1"
                size="sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Get Verified
              </Button>
              <Button
                onClick={onFindPlayers}
                variant="outline"
                size="sm"
                className="bg-transparent"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Find Players
              </Button>
            </div>
          </div>

          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between px-3 py-2 bg-secondary/20 rounded-lg text-xs text-muted-foreground hover:bg-secondary/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Tips to level up faster
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showTips ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showTips && (
            <div className="space-y-2 px-3 py-2 bg-secondary/10 rounded-lg border border-border/50">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">1.</span>
                  <span>
                    Ask friends who already use BrightID to evaluate you
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">2.</span>
                  <span>Join community verification events</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">3.</span>
                  <span>
                    Higher confidence evaluations increase your score more
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">4.</span>
                  <span>Connect with more verified players to build trust</span>
                </li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-full bg-aura-success/10 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-aura-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Verification Complete
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{`You meet the requirements for ${appName}`}</p>
          </div>
        </div>
      )}
    </div>
  )
}
