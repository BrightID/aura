export type MountFn = (el: HTMLElement) => (() => void) | void
export type MountModule = { mount: MountFn }

// In production all remotes are copied into the landing build and served from
// the same origin (see root vercel.json + scripts/copy-remotes.js). Override
// the prod URL per-remote via Vite env vars to point elsewhere if needed.
const REMOTE_URLS: Record<(typeof remotes)[number]["name"], { dev: string; prod: string }> = {
  core: {
    dev: "http://localhost:5173/core/src/mount.tsx",
    prod: import.meta.env.VITE_CORE_URL ?? "/core/remoteEntry.js",
  },
  dashboard: {
    dev: "http://localhost:5174/dashboard/app/mount.tsx",
    prod: import.meta.env.VITE_DASHBOARD_URL ?? "/dashboard/remoteEntry.js",
  },
  demo: {
    dev: "http://localhost:5175/demo/src/mount.tsx",
    prod: import.meta.env.VITE_DEMO_URL ?? "/demo/remoteEntry.js",
  },
  interface: {
    dev: "http://localhost:3000/interface/src/mount.ts",
    prod: import.meta.env.VITE_INTERFACE_URL ?? "/interface/remoteEntry.js",
  },
}

type RemoteName = keyof typeof REMOTE_URLS

export const remotes = (Object.keys(REMOTE_URLS) as RemoteName[]).map(
  (name): { name: RemoteName; prefix: string; load: () => Promise<MountModule> } => {
    const { dev, prod } = REMOTE_URLS[name]
    return {
      name,
      prefix: `/${name}`,
      load: () =>
        import(/* @vite-ignore */ import.meta.env.DEV ? dev : prod) as Promise<MountModule>,
    }
  },
)
