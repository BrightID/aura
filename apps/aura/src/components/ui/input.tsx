import * as React from 'react'

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number'
  label?: string
  name?: string
  placeholder?: string
  value?: string
  disabled?: boolean
  id?: string
  className?: string
  onChange?: (e: { target: { value: string } }) => void
}

const Input = React.forwardRef<HTMLElement, InputProps>(({ onChange, ...props }, ref) => {
  const innerRef = React.useRef<any>(null)

  React.useEffect(() => {
    const el = innerRef.current
    if (!el || !onChange) return
    const handler = (e: Event) => {
      onChange({ target: { value: (e as CustomEvent<string>).detail } })
    }
    el.addEventListener('change', handler)
    return () => el.removeEventListener('change', handler)
  }, [onChange])

  const mergedRef = (node: any) => {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.RefObject<any>).current = node
  }

  return <a-input ref={mergedRef} {...props} />
})
Input.displayName = 'Input'

export { Input }
