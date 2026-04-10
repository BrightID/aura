import * as React from 'react';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => (
  <a-scroll-area ref={ref as any} className={cn(className)} {...props}>
    {children}
  </a-scroll-area>
));
ScrollArea.displayName = 'ScrollArea';

function ScrollBar() {
  return null;
}

export { ScrollArea, ScrollBar };
