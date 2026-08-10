import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
  },
  server: {
    host: true,
    allowedHosts: ["localhost", ".localhost"],
  },
})
