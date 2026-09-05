import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import type { Options } from 'tsup';

const config: Options = {
  entry: ['src/index.ts', 'src/react.ts'],
  outDir: 'build',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  esbuildPlugins: [NodeModulesPolyfillPlugin({})],
  external: [],
};

export default config;
