import * as React from 'react';
import { cn } from '@/lib/utils';

type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  [key: string]: any;
};

function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: CustomEvent<{ open: boolean }>) => onOpenChange?.(e.detail.open);
    el.addEventListener('open-change', handler);
    return () => el.removeEventListener('open-change', handler);
  }, [onOpenChange]);

  return (
    <a-dialog ref={ref} open={open} {...props}>
      {children}
    </a-dialog>
  );
}

function DialogTrigger({
  children,
  asChild: _,
}: {
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  return (
    <div slot="trigger" style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

function DialogContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div slot="content" className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

function DialogClose({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DialogOverlay() {
  return null;
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
