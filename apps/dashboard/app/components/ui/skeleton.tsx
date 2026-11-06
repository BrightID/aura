import { cn } from '~/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('a-skeleton', className)}
      {...props}
    />
  );
}

export { Skeleton };
