import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/demo/",
  build: {
    // Nested so Vercel can serve /demo/assets/* as real files instead of
    // falling through the SPA rewrite to index.html (blank page).
    outDir: "dist/demo",
  },
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ["localhost", ".localhost"],
  },
})
