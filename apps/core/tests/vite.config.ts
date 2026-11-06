// Builds the pages in tests/ for scripts/visual-check.mjs. Output goes to
// VISUAL_OUT; relative base, so the pages open from disk.
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  root: resolve(__dirname, '..'),
  base: './',
  envDir: __dirname, // no .env here: the check never reads real settings
  plugins: [tailwindcss(), solid()],
  define: { __APP_VERSION__: '"visual-check"' },
  resolve: { alias: { '@': resolve(__dirname, '../src') } },
  build: {
    target: 'esnext',
    outDir: process.env.VISUAL_OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: ['cards.html', 'cards-light.html'].map((f) =>
        resolve(__dirname, f),
      ),
    },
  },
});
