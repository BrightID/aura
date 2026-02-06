import { cn } from "@/lib/utils"
import type { VerificationLevel, UserVerificationStatus } from "./types"

interface ProgressIndicatorProps {
  status: UserVerificationStatus
  requiredLevel: VerificationLevel
}

export function ProgressIndicator({
  status,
  requiredLevel,
}: ProgressIndicatorProps) {
  const progress = Math.min((status.currentLevel / requiredLevel) * 100, 100)
  const scoreProgress = Math.min((status.score / status.scoreNeeded) * 100, 100)
  const evalProgress = Math.min(
    (status.evaluationsReceived / status.evaluationsNeeded) * 100,
    100
  )

  return (
    <div className="space-y-4">
      {/* Main Level Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Verification Progress</span>
          <span className="font-medium text-foreground">
            Level {status.currentLevel} → Level {requiredLevel}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              progress >= 100 ? "bg-aura-success" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Detailed Requirements */}
      <div className="grid grid-cols-2 gap-3">
        {/* Evaluations */}
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Evaluations</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">
              {status.evaluationsReceived}
            </span>
            <span className="text-sm text-muted-foreground">
              / {status.evaluationsNeeded}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-aura-info rounded-full transition-all duration-500"
              style={{ width: `${evalProgress}%` }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span>Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold text-foreground">
              {status.score}
            </span>
            <span className="text-sm text-muted-foreground">
              / {status.scoreNeeded}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-aura-warning rounded-full transition-all duration-500"
              style={{ width: `${scoreProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
