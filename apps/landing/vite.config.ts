import path from "path"
import tailwindcss from "@tailwindcss/vite"
import solid from "vite-plugin-solid"
import { defineConfig } from "vite"

export default defineConfig({
  publicDir: "static",
  // Keep hashed JS/CSS off /assets so that path can be proxied to the
  // dashboard app (its current production build still loads /assets/*).
  build: {
    assetsDir: "l",
  },
  plugins: [tailwindcss(), solid()],
  resolve: {
    alias: {
      "$lib": path.resolve("src/lib"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["localhost", ".localhost"],
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
