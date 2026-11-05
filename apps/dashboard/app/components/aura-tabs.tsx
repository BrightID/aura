import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

/**
 * The tab buttons, styled by .a-tabs in @aura/ui/aura.css. Render each panel
 * yourself as <div role="tabpanel" className="a-tab-panel" hidden={...}>, so
 * inactive panels stay mounted.
 */
export function AuraTabs<T extends string>({
  value,
  onValueChange,
  tabs,
  compact,
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  tabs: { value: T; label: ReactNode }[];
  /** An underlined row instead of a filled pill bar. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('a-tabs', className)}
      data-compact={compact ? '' : undefined}
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          className="a-tab"
          aria-selected={value === t.value}
          onClick={() => onValueChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
