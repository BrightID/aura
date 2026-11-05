import * as React from 'react';
import { cn } from '~/lib/utils';

/** A decorative line; vertical ones stretch to their row's height. */
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      role="none"
      data-slot="separator"
      data-orientation={orientation}
      className={cn('a-separator', className)}
      {...props}
    />
  );
}

export { Separator };
