"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "~/lib/utils"

interface BotIconProps {
  className?: string
  style?: React.CSSProperties
  variant?: 1 | 2 | 3 | 4
}

export function BotIcon({ className, style, variant = 1 }: BotIconProps) {
  const bots = {
    1: (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={style}>
        <rect
          x="12"
          y="16"
          width="40"
          height="32"
          rx="4"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <rect
          x="8"
          y="24"
          width="4"
          height="12"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="52"
          y="24"
          width="4"
          height="12"
          rx="2"
          className="fill-primary"
        />
        <circle cx="24" cy="32" r="5" className="fill-primary" />
        <circle cx="40" cy="32" r="5" className="fill-primary" />
        <circle cx="24" cy="32" r="2" className="fill-background" />
        <circle cx="40" cy="32" r="2" className="fill-background" />
        <rect
          x="26"
          y="8"
          width="12"
          height="8"
          rx="2"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <rect
          x="30"
          y="2"
          width="4"
          height="6"
          rx="2"
          className="fill-primary"
        />
        <path
          d="M28 42 H36"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="20"
          y="48"
          width="8"
          height="8"
          rx="2"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <rect
          x="36"
          y="48"
          width="8"
          height="8"
          rx="2"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
      </svg>
    ),
    2: (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={style}>
        <circle
          cx="32"
          cy="32"
          r="20"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <circle cx="24" cy="28" r="4" className="fill-primary" />
        <circle cx="40" cy="28" r="4" className="fill-primary" />
        <circle cx="24" cy="28" r="1.5" className="fill-background" />
        <circle cx="40" cy="28" r="1.5" className="fill-background" />
        <path
          d="M24 38 Q32 44 40 38"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="28"
          y="6"
          width="8"
          height="6"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="6"
          y="28"
          width="6"
          height="8"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="52"
          y="28"
          width="6"
          height="8"
          rx="2"
          className="fill-primary"
        />
      </svg>
    ),
    3: (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={style}>
        <rect
          x="14"
          y="14"
          width="36"
          height="36"
          rx="6"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <rect
          x="20"
          y="24"
          width="10"
          height="6"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="34"
          y="24"
          width="10"
          height="6"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="26"
          y="36"
          width="12"
          height="4"
          rx="2"
          className="fill-primary"
        />
        <path
          d="M20 8 L20 14"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M44 8 L44 14"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="6" r="2" className="fill-primary" />
        <circle cx="44" cy="6" r="2" className="fill-primary" />
        <rect
          x="26"
          y="50"
          width="12"
          height="8"
          rx="2"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
      </svg>
    ),
    4: (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={style}>
        <path
          d="M16 20 L32 8 L48 20 L48 44 L32 56 L16 44 Z"
          className="fill-muted stroke-primary"
          strokeWidth="2"
        />
        <circle cx="26" cy="28" r="4" className="fill-primary" />
        <circle cx="38" cy="28" r="4" className="fill-primary" />
        <circle cx="26" cy="28" r="1.5" className="fill-background" />
        <circle cx="38" cy="28" r="1.5" className="fill-background" />
        <path
          d="M26 40 L32 44 L38 40"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="8"
          y="26"
          width="8"
          height="12"
          rx="2"
          className="fill-primary"
        />
        <rect
          x="48"
          y="26"
          width="8"
          height="12"
          rx="2"
          className="fill-primary"
        />
      </svg>
    ),
  }

  return bots[variant]
}

export function AnimatedBot({
  id,
  initialX,
  initialY,
  delay,
  variant,
  isExiting,
  isComplete,
}: {
  id: number
  initialX: number
  initialY: number
  delay: number
  variant: 1 | 2 | 3 | 4
  isExiting: boolean
  isComplete?: boolean
}) {
  const exitX = (Math.random() - 0.5) * 3000
  const exitY = (Math.random() - 0.5) * 3000
  const rotation = (Math.random() - 0.5) * 720

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{
        x: initialX,
        y: initialY,
        opacity: 0,
        scale: 0,
        rotate: 0,
      }}
      animate={
        isExiting
          ? {
              x: exitX,
              y: exitY,
              opacity: 0,
              scale: 0,
              rotate: rotation,
            }
          : {
              x: initialX + Math.sin(id) * 20,
              y: initialY + Math.cos(id) * 20,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }
      }
      transition={
        isExiting
          ? {
              duration: 0.8,
              ease: [0.32, 0, 0.67, 0],
              delay: Math.random() * 0.3,
            }
          : {
              duration: 0.6,
              delay,
              type: "spring",
              stiffness: 100,
            }
      }
    >
      <motion.div
        animate={
          !isExiting
            ? {
                y: [0, -10, 0],
                rotate: [-5, 5, -5],
              }
            : {}
        }
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <BotIcon
          className={cn("w-12 h-12 md:w-16 md:h-16 drop-shadow-lg")}
          variant={variant}
        />
      </motion.div>
    </motion.div>
  )
}
