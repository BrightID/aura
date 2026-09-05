'use client';

import { AInput, ASelect, ASwitch } from '@aura/ui/react-wrappers';
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
              <ASelect
                style={{ width: '9rem', marginBottom: 0 }}
                value={String(state[p.name] ?? '')}
                placeholder={p.default === undefined ? '— none —' : ''}
                options={(p.options ?? []).map((opt) => ({
                  label: opt,
                  value: opt,
                }))}
                onChange={(e: Event) =>
                  onChange(p.name, (e as CustomEvent<string>).detail)
                }
              />
            )}

            {p.type === 'boolean' && (
              <ASwitch
                checked={state[p.name] === true}
                onChange={(e: Event) =>
                  onChange(p.name, (e as CustomEvent<boolean>).detail)
                }
              />
            )}

            {(p.type === 'string' || p.type === 'number') && (
              <AInput
                style={{ width: '10rem', marginBottom: 0 }}
                type={p.type === 'number' ? 'number' : 'text'}
                value={String(state[p.name] ?? '')}
                placeholder={String(p.default ?? '')}
                onChange={(e: Event) =>
                  onChange(p.name, (e as CustomEvent<string>).detail)
                }
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
