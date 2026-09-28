import { createSignal } from 'solid-js';

// One-hour poll keeps long-lived tabs finding new deploys (old app's SW
// update cadence). The worker itself is emitted at build time by
// `sw-plugin.ts`; it precaches the bundle and waits for SKIP_WAITING.
const UPDATE_INTERVAL = 60 * 60 * 1000;
const DISMISS_KEY = 'aura-pwa-dismissed-sw';

function sessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function sessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

const [needRefresh, setNeedRefresh] = createSignal(false);
/** Precache id of the worker that is waiting, once it has answered. */
const [waitingCache, setWaitingCache] = createSignal<string | null>(null);
const [versionReady, setVersionReady] = createSignal(false);
const [dismissedCache, setDismissedCache] = createSignal(
  sessionGet(DISMISS_KEY),
);
let registration: ServiceWorkerRegistration | undefined;
let reloading = false;
let userRequestedUpdate = false;
let queried: ServiceWorker | null = null;

export { versionReady };

/** True once a new service-worker build is waiting to activate. */
export { needRefresh };

/** Ask the waiting worker which precache it installed. Script URL never changes. */
function queryCache(worker: ServiceWorker) {
  if (queried === worker) return;
  queried = worker;
  setVersionReady(false);
  const channel = new MessageChannel();
  const timer = window.setTimeout(() => {
    if (queried !== worker) return;
    setWaitingCache(null);
    setVersionReady(true);
  }, 800);
  channel.port1.onmessage = (event: MessageEvent) => {
    window.clearTimeout(timer);
    if (queried !== worker) return;
    const cache = (event.data as { cache?: unknown } | null)?.cache;
    setWaitingCache(typeof cache === 'string' ? cache : null);
    setVersionReady(true);
  };
  worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
}

/** True when this tab already dismissed the prompt for this waiting build. */
export function isUpdateDismissed(): boolean {
  const id = waitingCache();
  if (!id) return false;
  return dismissedCache() === id;
}

/** Hide the prompt for the current waiting build. Settings can still apply it. */
export function dismissUpdate(): void {
  const id = waitingCache();
  if (!id) return;
  sessionSet(DISMISS_KEY, id);
  setDismissedCache(id);
}

/** Activate the waiting service worker. Reload runs on the controller change. */
export function updateApp() {
  const worker = registration?.waiting ?? registration?.installing;
  if (!worker) return;
  userRequestedUpdate = true;
  worker.postMessage('SKIP_WAITING');
}

function markWaiting(worker: ServiceWorker | null) {
  if (!worker || !navigator.serviceWorker.controller) return;
  if (worker.state !== 'installed') return;
  queryCache(worker);
  setNeedRefresh(true);
}

/** Register the service worker (production only; safe to call once). */
export function initPwa() {
  if (!import.meta.env.PROD) return;
  if (registration || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // First install also claims clients. Reload only after the user updates.
    if (!userRequestedUpdate || reloading) return;
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register('/core/sw.js', { scope: '/core/' })
    .then((reg) => {
      registration = reg;

      // "installed" while a controller exists = an update is waiting
      // (first-ever install has no controller and needs no prompt).
      const watch = (worker: ServiceWorker | null) =>
        worker?.addEventListener('statechange', () => {
          markWaiting(worker);
        });

      markWaiting(reg.waiting);
      watch(reg.installing);
      reg.addEventListener('updatefound', () => watch(reg.installing));

      setInterval(() => reg.update(), UPDATE_INTERVAL);
    })
    .catch(() => {
      /* registration failed; leave needRefresh false */
    });
}
