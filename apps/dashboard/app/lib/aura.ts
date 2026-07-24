import { useEffect, useRef, type RefObject } from "react"

/**
 * Bind a `CustomEvent<T>` dispatched by an `@aura/ui` custom element to a React
 * handler. React 19 renders custom elements natively but does NOT wire up
 * `onX` props to their custom events (only native bubbling events like `click`
 * are caught by React's delegation) — so controlled `a-input` / `a-select` /
 * `a-switch` need their `change` event bound imperatively via a ref.
 *
 * @example
 *   const ref = useRef<HTMLElement>(null)
 *   useAuraEvent<string>(ref, "change", setValue)
 *   return <a-input ref={ref} value={value} />
 */
export function useAuraEvent<T = unknown, E extends EventTarget = HTMLElement>(
  ref: RefObject<E | null>,
  event: string,
  handler: (detail: T) => void,
) {
  const saved = useRef(handler)
  saved.current = handler

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const listener = (e: Event) => saved.current((e as CustomEvent<T>).detail)
    el.addEventListener(event, listener)
    return () => el.removeEventListener(event, listener)
  }, [ref, event])
}
