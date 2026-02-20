import type { TemplateResult } from "lit"

export type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "default"

export interface ToastOptions {
  id?: string
  duration?: number // ms
  variant?: ToastVariant
  description?: string
  action?: { label: string; onClick: () => void }
}

export interface ToastData extends ToastOptions {
  id: string
  message: string | TemplateResult
  createdAt: number
  visible: boolean
}

const toasts: ToastData[] = []
const listeners: ((toasts: ToastData[]) => void)[] = []

function emit() {
  listeners.forEach((cb) => cb([...toasts]))
}

export function toast(
  message: string | TemplateResult,
  options: ToastOptions = {},
): string {
  const id = options.id ?? crypto.randomUUID?.() ?? Date.now().toString(36)
  const duration =
    options.duration ?? (options.variant === "loading" ? Infinity : 4000)

  const t: ToastData = {
    id,
    message,
    createdAt: Date.now(),
    visible: false, // Start as false
    duration,
    ...options,
  }

  toasts.push(t)
  emit()

  // Trigger enter animation on next frame
  requestAnimationFrame(() => {
    const toast = toasts.find((t) => t.id === id)
    if (toast) {
      toast.visible = true
      emit()
    }
  })

  if (duration !== Infinity) {
    setTimeout(() => toast.dismiss(id), duration)
  }

  return id
}

toast.success = (msg: string, opts?: Omit<ToastOptions, "variant">) =>
  toast(msg, { ...opts, variant: "success" })
toast.error = (msg: string, opts?: Omit<ToastOptions, "variant">) =>
  toast(msg, { ...opts, variant: "error" })
toast.warning = (msg: string, opts?: Omit<ToastOptions, "variant">) =>
  toast(msg, { ...opts, variant: "warning" })
toast.info = (msg: string, opts?: Omit<ToastOptions, "variant">) =>
  toast(msg, { ...opts, variant: "info" })
toast.loading = (msg: string, opts?: Omit<ToastOptions, "variant">) =>
  toast(msg, { ...opts, variant: "loading" })

toast.dismiss = (id: string) => {
  const t = toasts.find((t) => t.id === id)
  if (t) {
    t.visible = false
    emit()
    // Wait for exit animation before removing from array
    setTimeout(() => {
      const idx = toasts.findIndex((t) => t.id === id)
      if (idx !== -1) toasts.splice(idx, 1)
      emit()
    }, 300) // Matches exit animation duration
  }
}

toast.promise = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((err: any) => string)
  },
  opts?: ToastOptions,
) => {
  const id = toast.loading(messages.loading, opts)
  try {
    const result = await promise
    const msg =
      typeof messages.success === "function"
        ? messages.success(result)
        : messages.success
    toast.dismiss(id)
    toast.success(msg, { id, ...opts })
    return result
  } catch (err) {
    const msg =
      typeof messages.error === "function"
        ? messages.error(err)
        : messages.error
    toast.dismiss(id)
    toast.error(msg, { id, ...opts })
    throw err
  }
}

export function subscribe(callback: (toasts: ToastData[]) => void) {
  listeners.push(callback)
  callback([...toasts])
  return () => {
    const idx = listeners.indexOf(callback)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}
