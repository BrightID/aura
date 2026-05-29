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
  server: {
    // Proxy the recovery channel/profile calls to the BrightID aura nodes to
    // avoid CORS during dev. `AURA_NODE_URL_PROXY` (`/auranode[-test]`) is used
    // as the channel base url; strip the prefix and forward to the real node.
    proxy: {
      '/auranode-test': {
        target: 'https://aura-test.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/auranode-test/, ''),
      },
      '/auranode': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/auranode/, ''),
      },
    },
  },
});
