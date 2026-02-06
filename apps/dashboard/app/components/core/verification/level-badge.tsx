import { cn } from "@/lib/utils"
import type { VerificationLevel } from "./types"

interface LevelBadgeProps {
  level: VerificationLevel | 0
  size?: "xs" | "sm" | "md" | "lg"
  showLabel?: boolean
}

const levelConfig = {
  0: {
    label: "Not Verified",
    description: "No verification yet",
    color: "bg-muted text-muted-foreground",
  },
  1: {
    label: "Level 1",
    description: "Basic human verification",
    color: "bg-aura-level-1/20 text-aura-level-1 border border-aura-level-1/30",
  },
  2: {
    label: "Level 2",
    description: "Medium verification",
    color: "bg-aura-info/20 text-aura-info border border-aura-info/30",
  },
  3: {
    label: "Level 3",
    description: "High verification",
    color: "bg-aura-success/20 text-aura-success border border-aura-success/30",
  },
}

export function LevelBadge({
  level,
  size = "md",
  showLabel = true,
}: LevelBadgeProps) {
  const config = levelConfig[level]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.color,
        size === "xs" && "px-1.5 py-0.5 text-[10px] gap-1",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base"
      )}
    >
      <span
        className={cn(
          "rounded-full bg-current",
          size === "xs" && "w-1 h-1",
          size === "sm" && "w-1.5 h-1.5",
          size === "md" && "w-2 h-2",
          size === "lg" && "w-2.5 h-2.5"
        )}
      />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

export function LevelRequirement({
  required,
  current,
}: {
  required: VerificationLevel
  current: VerificationLevel | 0
}) {
  const isMet = current >= required

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        isMet
          ? "bg-aura-success/10 text-aura-success border border-aura-success/20"
          : "bg-secondary text-muted-foreground border border-border"
      )}
    >
      {isMet ? (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
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
            d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-6a8 8 0 11-16 0 8 8 0 0116 0z"
          />
        </svg>
      )}
      <span>
        {isMet
          ? `Level ${required} requirement met`
          : `Level ${required} required`}
      </span>
    </div>
  )
}
