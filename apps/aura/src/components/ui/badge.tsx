import * as React from 'react';
import { cn } from '@/lib/utils';

type ShadcnBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const variantMap: Record<
  ShadcnBadgeVariant,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  default: 'default',
  secondary: 'secondary',
  destructive: 'destructive',
  outline: 'outline',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ShadcnBadgeVariant;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <a-badge
      variant={variantMap[variant]}
      className={cn(className)}
      {...props}
    />
  );
}

export { Badge };
