import * as React from 'react';
import { cn } from '~/lib/utils';

/** A native checkbox switch with Radix Switch's checked/onCheckedChange API. */
function Switch({
  className,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type' | 'role'> & {
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      className={cn('a-switch', className)}
      onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      {...props}
    />
  );
}

export { Switch };
