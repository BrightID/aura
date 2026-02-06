import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';
import { ReactRouterPreset } from './plugins/sw';

export default {
  ssr: false,
  appDirectory: 'src/app',
  presets: [vercelPreset(), ReactRouterPreset()],
} satisfies Config;
