import type { ComponentDoc } from './types';

export const badge: ComponentDoc = {
  slug: 'badge',
  name: 'Badge',
  element: 'span',
  className: 'a-badge',
  description:
    'Small inline label for statuses, tags, and counts. Set `rounded` for a pill shape.',
  slot: 'Badge',
  frame: 'center',
  props: [
    {
      name: 'variant',
      type: 'enum',
      options: [
        'default',
        'secondary',
        'outline',
        'destructive',
        'accent',
        'glass',
      ],
      default: 'default',
      description: 'Surface treatment and palette.',
    },
    {
      name: 'size',
      type: 'enum',
      options: ['xs', 'sm', 'md', 'lg'],
      default: 'md',
      description: 'Font size and padding.',
    },
    {
      name: 'rounded',
      type: 'boolean',
      default: false,
      description: 'Fully rounded pill shape.',
    },
  ],
  cssVars: [
    {
      name: '--secondary',
      default: 'oklch(0.255 0.022 246)',
      description: 'Secondary surface color.',
    },
    {
      name: '--accent',
      default: 'oklch(0.665 0.12 226)',
      description: 'Accent (electric cyan) color.',
    },
    {
      name: '--destructive',
      default: 'oklch(0.62 0.2 25)',
      description: 'Destructive color.',
    },
    {
      name: '--border',
      default: 'oklch(0.305 0.018 244)',
      description: 'Outline variant border color.',
    },
  ],
};
