import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '~/lib/utils';

type Variant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

/** shadcn's Button API on top of .a-button from @aura/ui/aura.css. */
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & {
  variant?: Variant | null;
  size?: Size | null;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(
        "a-button [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === 'link' && 'underline-offset-4 hover:underline',
        className,
      )}
      data-variant={
        variant === 'link'
          ? 'ghost'
          : variant === 'destructive' || variant === 'default'
            ? undefined
            : (variant ?? undefined)
      }
      data-color={variant === 'destructive' ? 'destructive' : undefined}
      data-size={size === 'default' ? undefined : (size ?? undefined)}
      {...props}
    />
  );
}

export { Button };
