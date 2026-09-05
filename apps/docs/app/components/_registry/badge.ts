import type { ComponentDoc } from './types';

export const badge: ComponentDoc = {
  slug: 'badge',
  name: 'Badge',
  tag: 'a-badge',
  description:
    'Small inline label for statuses, tags, and counts. Set `rounded` for a pill shape and `removable` to render a dismiss affordance.',
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
    {
      name: 'removable',
      type: 'boolean',
      default: false,
      description: 'Renders a trailing remove/dismiss control.',
    },
  ],
  cssVars: [
    {
      name: '--secondary',
      default: 'oklch(0.22 0.018 265)',
      description: 'Secondary surface color.',
    },
    {
      name: '--accent',
      default: 'oklch(0.68 0.18 195)',
      description: 'Accent (electric cyan) color.',
    },
    {
      name: '--destructive',
      default: 'oklch(0.57 0.22 20)',
      description: 'Destructive color.',
    },
    {
      name: '--border',
      default: 'oklch(0.27 0.018 265)',
      description: 'Outline variant border color.',
    },
  ],
};
