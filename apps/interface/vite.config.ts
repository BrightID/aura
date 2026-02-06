/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { litHMRPlugin } from './vite-plugin-lit-hmr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2022'
  },
  define: {
    'process.env': {}
  },
  plugins: [tsconfigPaths(), litHMRPlugin()],
  server: {
    proxy: {
      '^/auranode(/.*)?$': {
        target: 'https://aura-node.brightid.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/auranode/, ''),
        secure: process.env.NODE_ENV?.toLowerCase() !== 'development'
      },
      '^/auranode-test(/.*)?$': {
        target: 'https://aura-test.brightid.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/auranode-test/, ''),
        // Fixed regex
        secure: process.env.NODE_ENV?.toLowerCase() !== 'development'
      },
      '^/api(/.*)?$': {
        target: 'https://aura-get-verified.vercel.app',
        changeOrigin: true,
        secure: process.env.NODE_ENV?.toLowerCase() !== 'development'
      }
    }
  }
  // assetsInclude: ['**/*.html']
  ,

  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['packages/.storybook/vitest.setup.ts']
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['packages/ui/.storybook/vitest.setup.ts']
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['packages/ui/.storybook/vitest.setup.ts']
      }
    }]
  }
});