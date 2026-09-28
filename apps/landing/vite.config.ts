import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

const PORT = 5176;

export default defineConfig({
  appType: 'spa',
  publicDir: 'static',
  plugins: [tailwindcss(), solid()],
  resolve: {
    alias: {
      $lib: path.resolve('src/lib'),
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: PORT,
    origin: `http://localhost:${PORT}`,
    cors: true,
    host: true,
    allowedHosts: ['localhost', '.localhost'],
    // recovery.brightid.org sends no CORS headers. aura-node
    // /profile/upload rejects the Cache-Control preflight, so that
    // POST goes to the landing API path and this proxy forwards it.
    // /docs forwards to the docs app. Other /api routes are served by
    // `vercel dev` at the repo root (landing/api serverless functions).
    proxy: {
      '/api/profile/upload': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/profile/upload': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        secure: true,
      },
      '/core/brightid': {
        target: 'https://recovery.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/core\/brightid/, ''),
      },
      '/brightid': {
        target: 'https://recovery.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/brightid/, ''),
      },
      '/docs': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port: PORT,
    cors: true,
    proxy: {
      '/api/profile/upload': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
      '/profile/upload': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        decorators: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: false,
        useDefineForClassFields: false,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          decorators: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: false,
          useDefineForClassFields: false,
        },
      },
    },
  },
});
