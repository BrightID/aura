'use client';

import type { ComponentDoc } from '../_registry';
import type { PropState } from './snippet';

interface ControlsProps {
  doc: ComponentDoc;
  state: PropState;
  onChange: (name: string, value: string | boolean) => void;
}

const rowClass = 'flex items-center justify-between gap-4 py-2.5';
const labelClass = 'flex flex-col gap-0.5 min-w-0';
const nameClass =
  'font-[family-name:var(--font-geist-mono)] text-[0.8rem] text-[var(--foreground)]';
const hintClass = 'truncate text-xs text-[var(--muted-foreground)]';

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
            {p.type === 'enum' && (
              <select
                className="a-input"
                style={{ width: '9rem' }}
                aria-label={p.name}
                value={String(state[p.name] ?? '')}
                onChange={(e) => onChange(p.name, e.currentTarget.value)}
              >
                {p.default === undefined && <option value="">— none —</option>}
                {(p.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {p.type === 'boolean' && (
              <input
                type="checkbox"
                role="switch"
                className="a-switch"
                aria-label={p.name}
                checked={state[p.name] === true}
                onChange={(e) => onChange(p.name, e.currentTarget.checked)}
              />
            )}

            {(p.type === 'string' || p.type === 'number') && (
              <input
                className="a-input"
                style={{ width: '10rem' }}
                aria-label={p.name}
                type={p.type === 'number' ? 'number' : 'text'}
                value={String(state[p.name] ?? '')}
                placeholder={String(p.default ?? '')}
                onChange={(e) => onChange(p.name, e.currentTarget.value)}
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
