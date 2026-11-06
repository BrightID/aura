export type ToastVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'default';

export interface ToastOptions {
  id?: string;
  duration?: number; // ms
  variant?: ToastVariant;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Fired once when the toast is dismissed (not when the same id is replaced). */
  onDismiss?: () => void;
}

export interface ToastData extends ToastOptions {
  id: string;
  message: string;
  createdAt: number;
  visible: boolean;
}

const toasts: ToastData[] = [];
const listeners: ((toasts: ToastData[]) => void)[] = [];
const closing = new WeakSet<ToastData>();
const timers = new WeakMap<ToastData, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((cb) => cb([...toasts]));
}

// The helpers below act on toast objects. Only toast() and toast.dismiss()
// look a toast up by id, through liveToast, which skips closing toasts: while
// one is closing, a new toast can already have the same id (toast.promise does
// this).
const liveToast = (id: string) =>
  toasts.find((item) => item.id === id && !closing.has(item));

/** Shows a toast on the next frame, so its enter transition plays. */
function showSoon(t: ToastData) {
  requestAnimationFrame(() => {
    if (!toasts.includes(t) || closing.has(t)) return;
    t.visible = true;
    emit();
  });
}

/** (Re)starts a toast's auto-dismiss timer for its current duration. */
function schedule(t: ToastData) {
  clearTimeout(timers.get(t));
  timers.delete(t);
  if (t.duration !== undefined && t.duration !== Infinity)
    timers.set(
      t,
      setTimeout(() => close(t), t.duration),
    );
}

function close(t: ToastData) {
  if (!toasts.includes(t) || closing.has(t)) return;
  closing.add(t);
  clearTimeout(timers.get(t));
  t.visible = false;
  emit();
  t.onDismiss?.();
  // Wait for the exit transition before removing it.
  setTimeout(() => {
    const idx = toasts.indexOf(t);
    if (idx !== -1) toasts.splice(idx, 1);
    emit();
  }, 300); // matches the .a-toast transition in @aura/ui/aura.css
}

export function toast(message: string, options: ToastOptions = {}): string {
  const id = options.id ?? crypto.randomUUID?.() ?? Date.now().toString(36);
  const duration =
    options.duration ?? (options.variant === 'loading' ? Infinity : 4000);

  const existing = options.id ? liveToast(options.id) : undefined;
  if (existing) {
    existing.message = message;
    existing.createdAt = Date.now();
    existing.duration = duration;
    existing.variant = options.variant;
    existing.description = options.description;
    existing.action = options.action;
    existing.onDismiss = options.onDismiss;
    existing.visible = false;
    emit();
    showSoon(existing);
    schedule(existing);
    return existing.id;
  }

  const t: ToastData = {
    ...options,
    id,
    message,
    createdAt: Date.now(),
    visible: false, // shown on the next frame, by showSoon
    duration, // after the spread: options.duration may be undefined
  };

  toasts.push(t);
  emit();
  showSoon(t);
  schedule(t);
  return id;
}

toast.success = (msg: string, opts?: Omit<ToastOptions, 'variant'>) =>
  toast(msg, { ...opts, variant: 'success' });
toast.error = (msg: string, opts?: Omit<ToastOptions, 'variant'>) =>
  toast(msg, { ...opts, variant: 'error' });
toast.warning = (msg: string, opts?: Omit<ToastOptions, 'variant'>) =>
  toast(msg, { ...opts, variant: 'warning' });
toast.info = (msg: string, opts?: Omit<ToastOptions, 'variant'>) =>
  toast(msg, { ...opts, variant: 'info' });
toast.loading = (msg: string, opts?: Omit<ToastOptions, 'variant'>) =>
  toast(msg, { ...opts, variant: 'loading' });

toast.dismiss = (id: string) => {
  const t = liveToast(id);
  if (t) close(t);
};

toast.promise = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: any) => string);
  },
  opts?: ToastOptions,
) => {
  const id = toast.loading(messages.loading, opts);
  try {
    const result = await promise;
    const msg =
      typeof messages.success === 'function'
        ? messages.success(result)
        : messages.success;
    toast.dismiss(id);
    toast.success(msg, { id, ...opts });
    return result;
  } catch (err) {
    const msg =
      typeof messages.error === 'function'
        ? messages.error(err)
        : messages.error;
    toast.dismiss(id);
    toast.error(msg, { id, ...opts });
    throw err;
  }
};

export function subscribe(callback: (toasts: ToastData[]) => void) {
  listeners.push(callback);
  callback([...toasts]);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
