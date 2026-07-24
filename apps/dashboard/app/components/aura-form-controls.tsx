import { type ComponentProps, useRef } from "react"
import { useAuraEvent } from "~/lib/aura"

export function AuraInput({
  onValueChange,
  ...props
}: Omit<ComponentProps<"a-input">, "ref"> & {
  onValueChange?: (value: string) => void
}) {
  const ref = useRef<HTMLElementTagNameMap["a-input"]>(null)
  useAuraEvent<string>(ref, "change", (value) => onValueChange?.(value))

  return <a-input ref={ref} {...props} />
}

export function AuraTextarea({
  onValueChange,
  ...props
}: Omit<ComponentProps<"a-textarea">, "ref"> & {
  onValueChange?: (value: string) => void
}) {
  const ref = useRef<HTMLElementTagNameMap["a-textarea"]>(null)
  useAuraEvent<string>(ref, "change", (value) => onValueChange?.(value))

  return <a-textarea ref={ref} {...props} />
}

export function AuraSelect({
  onValueChange,
  ...props
}: Omit<ComponentProps<"a-select">, "ref"> & {
  onValueChange?: (value: string) => void
}) {
  const ref = useRef<HTMLElementTagNameMap["a-select"]>(null)
  useAuraEvent<string>(ref, "change", (value) => onValueChange?.(value))

  return <a-select ref={ref} {...props} />
}

export function AuraSwitch({
  onCheckedChange,
  ...props
}: Omit<ComponentProps<"a-switch">, "ref"> & {
  onCheckedChange?: (checked: boolean) => void
}) {
  const ref = useRef<HTMLElementTagNameMap["a-switch"]>(null)
  useAuraEvent<boolean>(ref, "change", (checked) => onCheckedChange?.(checked))

  return <a-switch ref={ref} {...props} />
}
