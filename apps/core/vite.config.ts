import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import solid from "vite-plugin-solid"
import pkg from "./package.json"
import {
  AURA_NODE_PROXY_PATH,
  AURA_TEST_NODE_PROXY_PATH,
  DEFAULT_AURA_NODE_URL,
  DEFAULT_AURA_TEST_NODE_URL,
  DEFAULT_RECOVERY_URL,
  RECOVERY_PROXY_PATH,
} from "./src/shared/lib/url-defaults"
import { auraPWA } from "./sw-plugin"

const stripPrefix = (prefix: string) => (path: string) =>
  path.replace(new RegExp(`^${prefix}`), "")

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "")

  return {
    plugins: [tailwindcss(), solid(), auraPWA(pkg.version)],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      allowedHosts: ["localhost", ".localhost"],
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
  }
})
