"use client";

import type { CssVarSpec } from "../_registry";

export type CssVarState = Record<string, string>;

interface CssVarsPanelProps {
  vars: CssVarSpec[];
  values: CssVarState;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
}

function looksLikeColor(value: string): boolean {
  return /^(oklch|rgb|hsl|#|var|color-mix|lab|lch)/i.test(value.trim());
}

export function CssVarsPanel({ vars, values, onChange, onReset }: CssVarsPanelProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-[var(--muted-foreground)]">
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
          const value = values[v.name] ?? v.default;
          return (
            <div key={v.name} className="flex items-center gap-3 py-2.5">
              {looksLikeColor(value) && (
                <span
                  aria-hidden
                  className="h-6 w-6 shrink-0 rounded-md border border-[color-mix(in_oklch,var(--border)_70%,transparent)]"
                  style={{ background: value }}
                />
              )}
              <label className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-[family-name:var(--font-geist-mono)] text-[0.8rem] text-[var(--foreground)]">
                  {v.name}
                </span>
                <span className="truncate text-xs text-[var(--muted-foreground)]">{v.description}</span>
              </label>
              <input
                value={value}
                spellCheck={false}
                onChange={(e) => onChange(v.name, e.target.value)}
                className="w-44 rounded-md border border-[color-mix(in_oklch,var(--border)_70%,transparent)] bg-[var(--input)] px-2.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-xs text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
