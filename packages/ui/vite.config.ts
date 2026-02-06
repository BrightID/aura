import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { resolve } from "path"
import dts from "vite-plugin-dts"

import pkg from "./package.json" with { type: "json" }

export default defineConfig({
  plugins: [tsconfigPaths(), dts()],

  build: {
    lib: {
      entry: [
        resolve(__dirname, "src/index.ts"),
        resolve(__dirname, "src/react.ts"),
      ],
      formats: ["es", "cjs"],
      fileName: (format) => `[name].${format === "es" ? "mjs" : "js"}`,
    },

    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",

        assetFileNames: "assets/[name][extname]",
      },

      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
        /node_modules/,
      ],
    },

    target: "esnext",
    sourcemap: true,
    minify: false,
  },
})
