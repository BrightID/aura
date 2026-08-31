import { resolve } from "node:path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { litHMRPlugin } from "./vite-plugin-lit-hmr"
import { injectRemoteCss } from "../vite-inject-remote-css"

const PORT = 3000

export default defineConfig({
  root: ".",
  base: "/interface/",
  build: {
    outDir: "dist",
    target: "esnext",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        mount: resolve(__dirname, "src/mount.ts"),
      },
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "mount" ? "remoteEntry.js" : "assets/[name]-[hash].js",
      },
    },
  },
  define: {
    "process.env": {},
  },
  plugins: [tsconfigPaths(), litHMRPlugin(), injectRemoteCss("/interface/")],
  server: {
    host: true,
    allowedHosts: ["localhost", ".localhost"],
    port: PORT,
    origin: `http://localhost:${PORT}`,
    cors: true,
    // No external proxies: aura-node is CORS-open (direct browser calls) and
    // the API under dev runs on the interface's own server at :3000.
  },
  preview: {
    port: PORT,
    cors: true,
  },
})
