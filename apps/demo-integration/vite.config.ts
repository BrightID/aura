import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { injectRemoteCss } from "../vite-inject-remote-css"

const PORT = 5175

export default defineConfig({
  base: "/demo/",
  plugins: [react(), injectRemoteCss("/demo/")],
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        mount: resolve(__dirname, "src/mount.tsx"),
      },
      preserveEntrySignatures: "exports-only",
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "mount" ? "remoteEntry.js" : "assets/[name]-[hash].js",
      },
    },
  },
  server: {
    port: PORT,
    origin: `http://localhost:${PORT}`,
    cors: true,
    host: true,
    allowedHosts: ["localhost", ".localhost"],
  },
  preview: {
    port: PORT,
    cors: true,
  },
})
