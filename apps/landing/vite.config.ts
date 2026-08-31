import path from "path"
import tailwindcss from "@tailwindcss/vite"
import solid from "vite-plugin-solid"
import { defineConfig } from "vite"

const PORT = 5176

export default defineConfig({
  appType: "spa",
  publicDir: "static",
  plugins: [tailwindcss(), solid()],
  resolve: {
    alias: {
      $lib: path.resolve("src/lib"),
    },
  },
  build: {
    target: "esnext",
  },
  server: {
    port: PORT,
    origin: `http://localhost:${PORT}`,
    cors: true,
    host: true,
    allowedHosts: ["localhost", ".localhost"],
    // Only recovery.brightid.org needs a dev proxy (it sends no CORS
    // headers). aura-node and the get-verified API are CORS-open and are
    // called directly. /docs forwards to the docs app's local dev server.
    proxy: {
      "/core/brightid": {
        target: "https://recovery.brightid.org",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/core\/brightid/, ""),
      },
      "/brightid": {
        target: "https://recovery.brightid.org",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/brightid/, ""),
      },
      "/docs": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port: PORT,
    cors: true,
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        decorators: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: false,
        useDefineForClassFields: false,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          decorators: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: false,
          useDefineForClassFields: false,
        },
      },
    },
  },
})
