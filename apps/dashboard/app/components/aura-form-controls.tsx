import type { ComponentProps } from 'react';
import { cn } from '~/lib/utils';

export type SelectOption = { label: string; value: string };

/** Native form controls styled by @aura/ui/aura.css, with value callbacks. */

export function AuraInput({
  onValueChange,
  className,
  ...props
}: ComponentProps<'input'> & { onValueChange?: (value: string) => void }) {
  return (
    <input
      className={cn('a-input', className)}
      onChange={(e) => onValueChange?.(e.currentTarget.value)}
      {...props}
    />
  );
}

export function AuraTextarea({
  onValueChange,
  className,
  ...props
}: ComponentProps<'textarea'> & { onValueChange?: (value: string) => void }) {
  return (
    <textarea
      className={cn('a-input', className)}
      onChange={(e) => onValueChange?.(e.currentTarget.value)}
      {...props}
    />
  );
}

/** With a placeholder, the first option shows it and has the value ''. */
export function AuraSelect({
  onValueChange,
  options,
  placeholder,
  className,
  ...props
}: ComponentProps<'select'> & {
  options: SelectOption[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <select
      className={cn('a-input', className)}
      onChange={(e) => onValueChange?.(e.currentTarget.value)}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function AuraSwitch({
  onCheckedChange,
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'role'> & {
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      role="switch"
      className={cn('a-switch', className)}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      {...props}
    />
  );
}

export function AuraSlider({
  value,
  min = 0,
  max = 100,
  onValueChange,
  className,
  style,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'value' | 'min' | 'max'> & {
  value: number;
  min?: number;
  max?: number;
  onValueChange?: (value: number) => void;
}) {
  // CSS can't read an input's value, so pass the fill width to aura.css.
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range"
      className={cn('a-slider', className)}
      value={value}
      min={min}
      max={max}
      style={{ ...style, ['--_pct' as string]: `${pct}%` }}
      onChange={(e) => onValueChange?.(e.currentTarget.valueAsNumber)}
      {...props}
    />
  );
}
