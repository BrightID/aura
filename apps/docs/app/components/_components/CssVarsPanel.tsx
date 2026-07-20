"use client"

import { AColorPicker, AInput } from "@aura/ui/react-wrappers"
import type { CssVarSpec } from "../_registry"

export type CssVarState = Record<string, string>

interface CssVarsPanelProps {
  vars: CssVarSpec[]
  values: CssVarState
  onChange: (name: string, value: string) => void
  onReset: () => void
}

function looksLikeColor(value: string): boolean {
  return /^(oklch|rgb|hsl|#|var|color-mix|lab|lch)/i.test(value.trim())
}

export function CssVarsPanel({
  vars,
  values,
  onChange,
  onReset,
}: CssVarsPanelProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Overrides are scoped to this preview.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
        >
          Reset
        </button>
      </div>

      <div className="divide-y divide-[color-mix(in_oklch,var(--border)_50%,transparent)]">
        {vars.map((v) => {
          const value = values[v.name] ?? v.default
          const isColor = looksLikeColor(value)
          return (
            <div key={v.name} className="flex items-center gap-3 py-2.5">
              {isColor && (
                <AColorPicker
                  value={value}
                  onChange={(e: Event) => onChange(v.name, (e as CustomEvent<string>).detail)}
                />
              )}
              <label className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-[family-name:var(--font-geist-mono)] text-[0.8rem] text-[var(--foreground)]">
                  {v.name}
                </span>
                <span className="truncate text-xs text-[var(--muted-foreground)]">
                  {v.description}
                </span>
              </label>
              <AInput
                style={{ width: "11rem", marginBottom: 0 }}
                value={value}
                onChange={(e: Event) => onChange(v.name, (e as CustomEvent<string>).detail)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
