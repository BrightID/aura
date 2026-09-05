import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import solid from 'vite-plugin-solid';
import pkg from './package.json';
import {
  DEFAULT_RECOVERY_URL,
  RECOVERY_PROXY_PATH,
} from './src/shared/lib/url-defaults';
import { auraPWA } from './sw-plugin';
import { injectRemoteCss } from '../vite-inject-remote-css';

const stripPrefix = (prefix: string) => (path: string) =>
  path.replace(new RegExp(`^${prefix}`), '');

const PORT = 5173;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    base: '/core/',
    plugins: [
      tailwindcss(),
      solid(),
      auraPWA(pkg.version),
      injectRemoteCss('/core/'),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          mount: resolve(__dirname, 'src/mount.tsx'),
        },
        preserveEntrySignatures: 'exports-only',
        output: {
          entryFileNames: (chunk) =>
            chunk.name === 'mount'
              ? 'remoteEntry.js'
              : 'assets/[name]-[hash].js',
        },
      },
    },
    server: {
      port: PORT,
      origin: `http://localhost:${PORT}`,
      cors: true,
      host: true,
      allowedHosts: ['localhost', '.localhost'],
      proxy: {
        // recovery.brightid.org sends no CORS headers → keep a same-origin
        // proxy for dev. aura-node is CORS-open and is called directly.
        [`/core${RECOVERY_PROXY_PATH}`]: {
          target: env.VITE_RECOVERY_URL ?? DEFAULT_RECOVERY_URL,
          changeOrigin: true,
          secure: true,
          rewrite: stripPrefix(`/core${RECOVERY_PROXY_PATH}`),
        },
        [RECOVERY_PROXY_PATH]: {
          target: env.VITE_RECOVERY_URL ?? DEFAULT_RECOVERY_URL,
          changeOrigin: true,
          secure: true,
          rewrite: stripPrefix(RECOVERY_PROXY_PATH),
        },
      },
    },
    preview: {
      port: PORT,
      cors: true,
    },
  };
});
