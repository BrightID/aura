import * as React from 'react'
import { cn } from '@/lib/utils'

type HoverCardProps = React.HTMLAttributes<HTMLElement> & {
  openDelay?: number
  closeDelay?: number
  side?: 'top' | 'bottom' | 'left' | 'right'
}

function HoverCard({ children, openDelay, closeDelay, side, ...props }: HoverCardProps) {
  return (
    <a-hover-card openDelay={openDelay} closeDelay={closeDelay} side={side} {...props}>
      {children}
    </a-hover-card>
  )
}

function HoverCardTrigger({
  children,
  asChild: _,
}: {
  children?: React.ReactNode
  asChild?: boolean
}) {
  return <a-hover-card-trigger slot="trigger">{children}</a-hover-card-trigger>
}

function HoverCardContent({
  children,
  className,
  align: _,
  sideOffset: __,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  return (
    <a-hover-card-content slot="content" className={cn(className)} {...props}>
      {children}
    </a-hover-card-content>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
