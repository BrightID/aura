import * as React from 'react';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
  }
>(({ className, orientation: _, decorative: __, ...props }, ref) => (
  <a-separator ref={ref as any} className={cn(className)} {...props} />
));
Separator.displayName = 'Separator';

export { Separator };
