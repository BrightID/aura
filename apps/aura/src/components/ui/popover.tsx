import * as React from 'react'
import { cn } from '@/lib/utils'

type PopoverProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
  const ref = React.useRef<any>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !onOpenChange) return
    const handler = (e: Event) => {
      onOpenChange((e as CustomEvent<{ open: boolean }>).detail.open)
    }
    el.addEventListener('open-changed', handler)
    return () => el.removeEventListener('open-changed', handler)
  }, [onOpenChange])

  return (
    <a-popover ref={ref} open={open}>
      {children}
    </a-popover>
  )
}

function PopoverTrigger({
  children,
  asChild: _,
}: {
  children?: React.ReactNode
  asChild?: boolean
}) {
  return (
    <div slot="trigger" style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

function PopoverContent({
  children,
  className,
  align: _,
  sideOffset: __,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <div slot="content" className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function PopoverAnchor({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
