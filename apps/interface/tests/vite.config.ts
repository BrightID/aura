// Builds the pages in tests/ for scripts/visual-check.mjs. Output goes to
// VISUAL_OUT; relative base, so the pages open from disk.
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: resolve(__dirname, '..'),
  base: './',
  envDir: __dirname, // no .env here: the check never reads real settings
  define: { 'process.env': {} },
  plugins: [tailwindcss(), tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: process.env.VISUAL_OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: ['design.html', 'widgets.html', 'widgets-light.html'].map((f) =>
        resolve(__dirname, f),
      ),
    },
  },
});
