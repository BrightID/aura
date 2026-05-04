import * as React from 'react'
import { cn } from '@/lib/utils'

type TabsProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  className?: string
}

function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const ref = React.useRef<any>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e: CustomEvent<{ value: string }>) => onValueChange?.(e.detail.value)
    el.addEventListener('change', handler)
    return () => el.removeEventListener('change', handler)
  }, [onValueChange])

  return (
    <a-tabs ref={ref} value={value ?? defaultValue} className={cn(className)}>
      {children}
    </a-tabs>
  )
}

// a-tabs queries its direct children for a-tab elements via slot assignment,
// so TabsList must not add a DOM wrapper node
function TabsList({ children }: React.HTMLAttributes<HTMLElement>) {
  return <>{children}</>
}

function TabsTrigger({
  value,
  children,
  className,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLElement> & { value: string; disabled?: boolean }) {
  return (
    <a-tab value={value} disabled={disabled} className={cn(className)} {...props}>
      {children}
    </a-tab>
  )
}

function TabsContent({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { value: string }) {
  return (
    <a-tab-panel slot="panel" value={value} className={cn(className)} {...props}>
      {children}
    </a-tab-panel>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
