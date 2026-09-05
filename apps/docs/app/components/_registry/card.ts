import type { ComponentDoc } from './types';

export const card: ComponentDoc = {
  slug: 'card',
  name: 'Card',
  tag: 'a-card',
  description:
    'Elevated surface for grouping content. Glass is the default treatment; use `variant="default"` for a solid card, and `interactive` when the whole card is a click target.',
  slot: 'Card content',
  frame: 'block',
  props: [
    {
      name: 'variant',
      type: 'enum',
      options: ['default', 'glass'],
      default: 'glass',
      description: 'Solid surface or frosted glass.',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: false,
      description: 'Pointer cursor, hover lift, and press feedback.',
    },
  ],
  cssVars: [
    {
      name: '--card',
      default: 'oklch(0.16 0.015 265)',
      description: 'Base card surface color.',
    },
    {
      name: '--card-bg',
      default: 'var(--card)',
      description: 'Override for the card background.',
    },
    {
      name: '--card-border',
      default: 'color-mix(in oklch, var(--border) 60%, transparent)',
      description: 'Card border color (default variant).',
    },
    { name: '--radius', default: '0.75rem', description: 'Corner radius.' },
    {
      name: '--blur',
      default: '2px',
      description: 'Backdrop blur amount (glass variant).',
    },
  ],
};
