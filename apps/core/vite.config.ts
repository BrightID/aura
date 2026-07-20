import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import solid from 'vite-plugin-solid';
import { defineConfig, loadEnv } from 'vite';
import pkg from './package.json';
import { auraPWA } from './sw-plugin';
import {
  AURA_NODE_PROXY_PATH,
  AURA_TEST_NODE_PROXY_PATH,
  DEFAULT_AURA_NODE_URL,
  DEFAULT_AURA_TEST_NODE_URL,
  DEFAULT_RECOVERY_URL,
  RECOVERY_PROXY_PATH,
} from './src/shared/lib/url-defaults';

const stripPrefix = (prefix: string) => (path: string) =>
  path.replace(new RegExp(`^${prefix}`), '');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [tailwindcss(), solid(), auraPWA(pkg.version)],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      // Proxy node + recovery calls to avoid CORS during dev. Targets are
      // env-overridable; defaults live in src/shared/lib/url-defaults.ts.
      // vercel.json mirrors these rewrites for production.
      proxy: {
        [AURA_TEST_NODE_PROXY_PATH]: {
          target: env.VITE_AURA_TEST_NODE_URL ?? DEFAULT_AURA_TEST_NODE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: stripPrefix(AURA_TEST_NODE_PROXY_PATH),
        },
        [AURA_NODE_PROXY_PATH]: {
          target: env.VITE_AURA_NODE_URL ?? DEFAULT_AURA_NODE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: stripPrefix(AURA_NODE_PROXY_PATH),
        },
        // BrightID recovery service — encrypted backup downloads
        [RECOVERY_PROXY_PATH]: {
          target: env.VITE_RECOVERY_URL ?? DEFAULT_RECOVERY_URL,
          changeOrigin: true,
          secure: true,
          rewrite: stripPrefix(RECOVERY_PROXY_PATH),
        },
      },
    },
  };
});
