import tailwindcss from "@tailwindcss/vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
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
