// Builds the pages in tests/ for scripts/visual-check.mjs. Output goes to
// VISUAL_OUT; relative base, so the pages open from disk. The script passes
// fake VITE_SOME_FIREBASE_* values; envDir keeps any real .env out.
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: resolve(__dirname, '..'),
  base: './',
  envDir: __dirname,
  define: { APP_VERSION: '"visual-check"' },
  plugins: [tailwindcss(), react(), tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: process.env.VISUAL_OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: ['visual.html', 'visual-light.html', 'sidebar.html'].map((f) =>
        resolve(__dirname, f),
      ),
    },
  },
});
