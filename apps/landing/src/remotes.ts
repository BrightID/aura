export type MountFn = (el: HTMLElement) => (() => void) | void;
export type MountModule = { mount: MountFn };

type RemoteConfig = {
  dev: string;
  prod: string;
  /** Vite React Fast Refresh runtime. Required in DEV for React remotes. */
  reactRefresh?: string;
};

// In production all remotes are copied into the landing build and served from
// the same origin (see root vercel.json + scripts/copy-remotes.js). Override
// the prod URL per-remote via Vite env vars to point elsewhere if needed.
const REMOTE_URLS = {
  core: {
    dev: 'http://localhost:5173/core/src/mount.tsx',
    prod: import.meta.env.VITE_CORE_URL ?? '/core/remoteEntry.js',
  },
  dashboard: {
    dev: 'http://localhost:5174/dashboard/app/mount.tsx',
    prod: import.meta.env.VITE_DASHBOARD_URL ?? '/dashboard/remoteEntry.js',
    reactRefresh: 'http://localhost:5174/dashboard/@react-refresh',
  },
  demo: {
    dev: 'http://localhost:5175/demo/src/mount.tsx',
    prod: import.meta.env.VITE_DEMO_URL ?? '/demo/remoteEntry.js',
    reactRefresh: 'http://localhost:5175/demo/@react-refresh',
  },
  interface: {
    dev: 'http://localhost:3000/interface/src/mount.ts',
    prod: import.meta.env.VITE_INTERFACE_URL ?? '/interface/remoteEntry.js',
  },
} satisfies Record<string, RemoteConfig>;

type RemoteName = keyof typeof REMOTE_URLS;

/** Host is Solid; React remotes need Vite's refresh preamble on the page in DEV. */
async function installReactRefreshPreamble(url: string) {
  const w = window as Window & {
    __vite_plugin_react_preamble_installed__?: boolean;
    $RefreshReg$?: () => void;
    $RefreshSig$?: () => (type: unknown) => unknown;
  };
  if (w.__vite_plugin_react_preamble_installed__) return;

  const runtime = (await import(/* @vite-ignore */ url)) as {
    injectIntoGlobalHook?: (target: Window) => void;
    default?: { injectIntoGlobalHook: (target: Window) => void };
  };
  const inject =
    runtime.injectIntoGlobalHook ?? runtime.default?.injectIntoGlobalHook;
  inject?.(window);
  w.$RefreshReg$ = () => {};
  w.$RefreshSig$ = () => (type) => type;
  w.__vite_plugin_react_preamble_installed__ = true;
}

export const remotes = (Object.keys(REMOTE_URLS) as RemoteName[]).map(
  (
    name,
  ): { name: RemoteName; prefix: string; load: () => Promise<MountModule> } => {
    const { dev, prod, reactRefresh } = REMOTE_URLS[name];
    return {
      name,
      prefix: `/${name}`,
      load: async () => {
        if (import.meta.env.DEV && reactRefresh) {
          await installReactRefreshPreamble(reactRefresh);
        }
        return import(
          /* @vite-ignore */ import.meta.env.DEV ? dev : prod
        ) as Promise<MountModule>;
      },
    };
  },
);
