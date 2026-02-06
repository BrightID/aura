"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type {
  AuraFrameConfig,
  FrameTheme,
  UserVerificationStatus,
  VerificationLevel,
} from "~/components/core/verification/types"
import { AuraVerificationFrame } from "~/components/core/verification/verification-frame"
import type { Project } from "~/types/projects"

const demoApps: Omit<AuraFrameConfig, "onVerified" | "onClose">[] = [
  {
    appName: "Gitcoin Grants",
    appDescription:
      "Decentralized funding for open source projects. Verify to participate in funding rounds.",
    requiredLevel: 2,
  },
  {
    appName: "DAO Governance",
    appDescription:
      "Vote on community proposals and participate in decentralized governance.",
    requiredLevel: 1,
  },
  {
    appName: "Premium Access",
    appDescription:
      "Unlock exclusive features with highest verification level.",
    requiredLevel: 3,
  },
]

const themes: { value: FrameTheme; label: string; preview: string }[] = [
  { value: "dark", label: "Dark", preview: "bg-[#1a1a2e]" },
  { value: "light", label: "Light", preview: "bg-[#f8fafc]" },
  { value: "emerald", label: "Emerald", preview: "bg-[#064e3b]" },
  { value: "ocean", label: "Ocean", preview: "bg-[#0c4a6e]" },
  { value: "sunset", label: "Sunset", preview: "bg-[#431407]" },
]

export default function PreviewTab({ project }: { project: Project }) {
  const [showFrame, setShowFrame] = useState(true)
  const [verificationResult, setVerificationResult] = useState<{
    userId: string
    level: VerificationLevel
  } | null>(null)

  const [selectedTheme, setSelectedTheme] = useState<FrameTheme>("dark")
  const [userStatus, setUserStatus] = useState<UserVerificationStatus>({
    isConnected: true,
    userId: "aura_demo_user_123",
    currentLevel: 1,
    evaluationsReceived: 2,
    evaluationsNeeded: 5,
    score: 45,
    scoreNeeded: 100,
  })

  const handleVerified = (userId: string, level: VerificationLevel) => {
    setVerificationResult({ userId, level })
  }

  const handleLevelChange = (value: number[]) => {
    setUserStatus((prev) => ({
      ...prev,
      currentLevel: value[0] as 0 | 1 | 2 | 3,
    }))
  }

  const handleEvaluationsChange = (value: number[]) => {
    setUserStatus((prev) => ({ ...prev, evaluationsReceived: value[0] }))
  }

  const handleScoreChange = (value: number[]) => {
    setUserStatus((prev) => ({ ...prev, score: value[0] }))
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-2 items-start">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-2">
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                App Configuration
              </h3>
            </div>

            {/* User Profile Controls */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
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
                User Profile (Mock)
              </h3>

              {/* Level Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Current Level
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {userStatus.currentLevel}
                  </span>
                </div>
                <Slider
                  value={[userStatus.currentLevel]}
                  onValueChange={handleLevelChange}
                  min={0}
                  max={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>None</span>
                  <span>L1</span>
                  <span>L2</span>
                  <span>L3</span>
                </div>
              </div>

              {/* Evaluations Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Evaluations Received
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {userStatus.evaluationsReceived}/
                    {userStatus.evaluationsNeeded}
                  </span>
                </div>
                <Slider
                  value={[userStatus.evaluationsReceived]}
                  onValueChange={handleEvaluationsChange}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Score Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Verification Score
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {userStatus.score}%
                  </span>
                </div>
                <Slider
                  value={[userStatus.score]}
                  onValueChange={handleScoreChange}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4 md:col-span-2">
              <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Frame Theme
              </h3>

              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSelectedTheme(theme.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedTheme === theme.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${theme.preview} border border-white/20`}
                    />
                    <span className="text-sm text-foreground">
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className="p-4 rounded-xl bg-aura-success/10 border border-aura-success/20">
              <div className="flex items-center gap-2 text-aura-success">
                <svg
                  className="w-5 h-5"
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
                <span className="font-medium">
                  Verification Callback Received
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground font-mono">
                <p>userId: "{verificationResult.userId}"</p>
                <p>level: {verificationResult.level}</p>
              </div>
            </div>
          )}

          {/* Integration Code */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Integration Code
            </h3>
            <div className="p-3 rounded-lg bg-background/50 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono">
                {`<AuraVerificationFrame
  appName="${project.name}"
  appDescription="${project.description}"
  requiredLevel={${project.requirementLevel}}
  theme="${selectedTheme}"}
  onVerified={(userId, level) => {
    // Handle verification
  }}
/>`}
              </pre>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="flex justify-center">
              <AuraVerificationFrame
                appDescription={project.description}
                appName={project.name}
                requiredLevel={project.requirementLevel as VerificationLevel}
                appLogo={project.logoUrl!}
                theme={selectedTheme}
                testMode={project.brightIdApp?.testing ?? true}
                externalUserStatus={userStatus}
                onUserStatusChange={setUserStatus}
                onVerified={handleVerified}
                onClose={() => setShowFrame(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
