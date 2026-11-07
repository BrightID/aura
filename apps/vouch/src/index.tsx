/* @refresh reload */
// vite-plugin-solid: reload the whole page when this entry file changes,
// because it calls mount() once and can't be hot-swapped.

import { mount } from '@/mount';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root not found');
}

mount(root);
