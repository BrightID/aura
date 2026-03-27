"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import type { VerificationLevel } from "~/components/core/verification/types";
import { AuraVerificationFrame } from "~/components/core/verification/verification-frame";
import {
  DEFAULT_DEMO_CONFIG,
  DEMO_APP_PRESETS,
  DEMO_THEMES,
  toUserStatus,
  type DemoConfig,
} from "~/components/core/verification/demo-config";
import type { Project } from "~/types/projects";

export default function PreviewTab({ project }: { project: Project }) {
  const [config, setConfig] = useState<DemoConfig>({
    ...DEFAULT_DEMO_CONFIG,
    appName: project.name,
    appDescription: project.description,
    appLogo: project.logoUrl ?? undefined,
    requiredLevel:
      (project.requirementLevel as VerificationLevel) ??
      DEFAULT_DEMO_CONFIG.requiredLevel,
    testMode: project.brightIdApp?.testing ?? true,
  });

  const [verificationResult, setVerificationResult] = useState<{
    userId: string;
    level: VerificationLevel;
  } | null>(null);

  const update = (patch: Partial<DemoConfig>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const userStatus = toUserStatus(config);

  return (
    <div className="mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-2 items-start">
        {/* Controls */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-2">
            {/* App Configuration */}
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

              {/* Preset buttons */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">
                  Demo Preset
                </label>
                <div className="flex flex-col gap-1">
                  {DEMO_APP_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        update({
                          appName: preset.appName,
                          appDescription: preset.appDescription,
                          requiredLevel: preset.requiredLevel,
                        })
                      }
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                        config.appName === preset.appName
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-muted-foreground/50 text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">{preset.label}</span>
                      <span className="ml-2 opacity-60">
                        Level {preset.requiredLevel} required
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Required level slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Required Level
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {config.requiredLevel}
                  </span>
                </div>
                <Slider
                  value={[config.requiredLevel]}
                  onValueChange={([v]) =>
                    update({ requiredLevel: v as VerificationLevel })
                  }
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>L1</span>
                  <span>L2</span>
                  <span>L3</span>
                </div>
              </div>
            </div>

            {/* User Profile (Mock) */}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Current Level
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {config.currentLevel}
                  </span>
                </div>
                <Slider
                  value={[config.currentLevel]}
                  onValueChange={([v]) =>
                    update({ currentLevel: v as 0 | 1 | 2 | 3 })
                  }
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Evaluations Received
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {config.evaluationsReceived}/{config.evaluationsNeeded}
                  </span>
                </div>
                <Slider
                  value={[config.evaluationsReceived]}
                  onValueChange={([v]) => update({ evaluationsReceived: v })}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Verification Score
                  </label>
                  <span className="text-xs font-mono text-foreground">
                    {config.score}%
                  </span>
                </div>
                <Slider
                  value={[config.score]}
                  onValueChange={([v]) => update({ score: v })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Theme */}
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
                {DEMO_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => update({ theme: theme.value })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      config.theme === theme.value
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

          {/* Verification callback result */}
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
                <p>userId: &quot;{verificationResult.userId}&quot;</p>
                <p>level: {verificationResult.level}</p>
              </div>
            </div>
          )}

          {/* Integration snippet */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Integration Code
            </h3>
            <div className="p-3 rounded-lg bg-background/50 overflow-x-auto">
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre">
                {/*<AuraVerificationFrame
                  appName={config.appName}
                  appDescription={config.appDescription}
                  requiredLevel={config.requiredLevel}
                  theme={config.theme}
                ></AuraVerificationFrame>*/}
                {`<AuraVerificationFrame
  appName="${config.appName}"
  appDescription="${config.appDescription}"
  requiredLevel={${config.requiredLevel}}
  theme="${config.theme}"
  onVerified={(userId, level) => {
    // Handle verification
  }}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Live frame preview */}
        <div className="lg:sticky lg:top-24">
          <div className="flex justify-center">
            <AuraVerificationFrame
              appName={config.appName}
              appDescription={config.appDescription}
              appLogo={config.appLogo}
              requiredLevel={config.requiredLevel}
              theme={config.theme}
              testMode={config.testMode}
              externalUserStatus={userStatus}
              onUserStatusChange={(status) =>
                setConfig((prev) => ({
                  ...prev,
                  isConnected: status.isConnected,
                  userId: status.userId ?? prev.userId,
                  currentLevel: status.currentLevel,
                  evaluationsReceived: status.evaluationsReceived,
                  evaluationsNeeded: status.evaluationsNeeded,
                  score: status.score,
                  scoreNeeded: status.scoreNeeded,
                }))
              }
              onVerified={(userId, level) =>
                setVerificationResult({ userId, level })
              }
              onClose={() => setVerificationResult(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
