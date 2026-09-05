import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { injectRemoteCss } from '../vite-inject-remote-css';

const PORT = 5174;

export default defineConfig({
  base: '/dashboard/',
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    tailwindcss(),
    react(),
    tsconfigPaths(),
    injectRemoteCss('/dashboard/'),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        mount: resolve(__dirname, 'app/mount.tsx'),
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
  preview: {
    port: PORT,
    cors: true,
  },
});
