import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { injectRemoteCss } from '../vite-inject-remote-css';

const PORT = 5177;

export default defineConfig({
  base: '/vouch/',
  plugins: [tailwindcss(), solid(), injectRemoteCss('/vouch/')],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        mount: resolve(__dirname, 'src/mount.tsx'),
      },
      preserveEntrySignatures: 'exports-only',
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'mount' ? 'remoteEntry.js' : 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    port: PORT,
    origin: `http://localhost:${PORT}`,
    cors: true,
    host: true,
    allowedHosts: ['localhost', '.localhost'],
  },
  preview: { port: PORT, cors: true },
});
