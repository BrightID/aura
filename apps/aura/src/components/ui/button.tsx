import * as React from 'react';

type ShadcnVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
type ShadcnSize = 'default' | 'sm' | 'lg' | 'icon';

const variantMap: Record<ShadcnVariant, 'default' | 'secondary' | 'ghost'> = {
  default: 'default',
  destructive: 'default',
  outline: 'secondary',
  secondary: 'secondary',
  ghost: 'ghost',
  link: 'ghost',
};

const colorMap: Record<
  ShadcnVariant,
  'primary' | 'secondary' | 'destructive'
> = {
  default: 'primary',
  destructive: 'destructive',
  outline: 'primary',
  secondary: 'secondary',
  ghost: 'primary',
  link: 'primary',
};

const sizeMap: Record<ShadcnSize, 'sm' | 'md' | 'lg'> = {
  default: 'md',
  sm: 'sm',
  lg: 'lg',
  icon: 'sm',
};

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: ShadcnVariant;
  size?: ShadcnSize;
  asChild?: boolean;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    { variant = 'default', size = 'default', asChild: _, style, children, ...props },
    ref,
  ) => {
    const iconStyle: React.CSSProperties =
      size === 'icon'
        ? { width: '2.25rem', height: '2.25rem', padding: '0', minWidth: 0 }
        : {};
    return (
      <a-button
        ref={ref as any}
        variant={variantMap[variant]}
        color={colorMap[variant] as any}
        size={sizeMap[size]}
        style={{ ...iconStyle, ...style }}
        {...props}
      >
        {children}
      </a-button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
