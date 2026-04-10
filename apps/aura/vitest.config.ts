import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './__tests__/setup.ts',
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    'process.env': process.env,
  },
});
