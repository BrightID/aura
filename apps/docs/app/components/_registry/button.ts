import type { ComponentDoc } from './types';

export const button: ComponentDoc = {
  slug: 'button',
  name: 'Button',
  element: 'button',
  className: 'a-button',
  fixedAttrs: { type: 'button' },
  description:
    'Clickable action element. Combine a `variant` (surface treatment) with a `color` (palette) — or set `aria-pressed` for a toggle/pill that fills in the primary palette regardless of variant.',
  slot: 'Button',
  frame: 'center',
  props: [
    {
      name: 'variant',
      type: 'enum',
      options: ['default', 'secondary', 'ghost', 'outline', 'glass'],
      default: 'default',
      description:
        'Surface treatment: filled, tinted, transparent, bordered, or frosted glass.',
    },
    {
      name: 'size',
      type: 'enum',
      options: ['sm', 'md', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      default: 'md',
      description:
        'Height and padding. The `icon*` sizes render a square button for a single glyph.',
    },
    {
      name: 'color',
      type: 'enum',
      options: ['primary', 'secondary', 'success', 'warning', 'destructive'],
      default: 'primary',
      description: 'Palette the variant draws from.',
    },
    {
      name: 'disabled',
      attr: 'disabled',
      type: 'boolean',
      default: false,
      description: 'Dims the button and blocks pointer events.',
    },
    {
      name: 'selected',
      attr: 'aria-pressed',
      type: 'boolean',
      default: false,
      description:
        'Toggle state — fills in the primary palette, overriding the variant.',
    },
  ],
  cssVars: [
    {
      name: '--primary',
      default: 'oklch(0.69 0.14 182)',
      description: 'Primary palette base color.',
    },
    {
      name: '--primary-foreground',
      default: 'oklch(0.115 0.018 226)',
      description: 'Text/foreground on primary surfaces.',
    },
    { name: '--radius', default: '0.625rem', description: 'Corner radius.' },
    {
      name: '--destructive',
      default: 'oklch(0.62 0.2 25)',
      description: 'Destructive palette base color.',
    },
  ],
};
