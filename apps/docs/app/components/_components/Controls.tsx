"use client";

import type { ComponentDoc } from "../_registry";
import type { PropState } from "./snippet";

interface ControlsProps {
  doc: ComponentDoc;
  state: PropState;
  onChange: (name: string, value: string | boolean) => void;
}

const rowClass = "flex items-center justify-between gap-4 py-2.5";
const labelClass = "flex flex-col gap-0.5 min-w-0";
const nameClass = "font-[family-name:var(--font-geist-mono)] text-[0.8rem] text-[var(--foreground)]";
const hintClass = "truncate text-xs text-[var(--muted-foreground)]";

export function Controls({ doc, state, onChange }: ControlsProps) {
  return (
    <div className="divide-y divide-[color-mix(in_oklch,var(--border)_50%,transparent)]">
      {doc.props.map((p) => (
        <div key={p.name} className={rowClass}>
          <span className={labelClass}>
            <span className={nameClass}>{p.name}</span>
            <span className={hintClass}>{p.description}</span>
          </span>

          <span className="shrink-0">
            {p.type === "enum" && (
              <select
                value={String(state[p.name] ?? "")}
                onChange={(e) => onChange(p.name, e.target.value)}
                className="min-w-[8rem] rounded-md border border-[color-mix(in_oklch,var(--border)_70%,transparent)] bg-[var(--input)] px-2.5 py-1.5 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                {p.default === undefined && <option value="">— none —</option>}
                {p.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {p.type === "boolean" && (
              <button
                type="button"
                role="switch"
                aria-checked={state[p.name] === true}
                onClick={() => onChange(p.name, !(state[p.name] === true))}
                className={`relative h-6 w-11 rounded-full border transition-colors ${
                  state[p.name] === true
                    ? "border-transparent bg-[var(--primary)]"
                    : "border-[color-mix(in_oklch,var(--border)_70%,transparent)] bg-[var(--input)]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    state[p.name] === true ? "translate-x-[1.4rem]" : "translate-x-0.5"
                  }`}
                />
              </button>
            )}

            {(p.type === "string" || p.type === "number") && (
              <input
                type={p.type === "number" ? "number" : "text"}
                value={String(state[p.name] ?? "")}
                placeholder={String(p.default ?? "")}
                onChange={(e) => onChange(p.name, e.target.value)}
                className="w-40 rounded-md border border-[color-mix(in_oklch,var(--border)_70%,transparent)] bg-[var(--input)] px-2.5 py-1.5 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
