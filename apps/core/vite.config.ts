import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), solid()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
