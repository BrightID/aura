import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '~/lib/utils';

/** shadcn's Badge API on top of .a-badge from @aura/ui/aura.css. */
function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | null;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      className={cn(
        'a-badge [&>svg]:size-3',
        // .a-badge has no primary variant; shadcn's default badge is primary.
        variant === 'default' && 'bg-primary text-primary-foreground',
        className,
      )}
      data-variant={variant === 'default' ? undefined : (variant ?? undefined)}
      data-size="sm"
      {...props}
    />
  );
}

export { Badge };
