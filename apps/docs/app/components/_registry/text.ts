import type { ComponentDoc } from './types';

export const text: ComponentDoc = {
  slug: 'text',
  name: 'Text',
  element: 'p',
  className: 'a-text',
  description:
    'Typographic primitive. Pick a semantic `variant` for the type scale; `size` overrides the raw font size when you need finer control.',
  slot: 'The quick brown fox jumps over the lazy dog.',
  frame: 'block',
  props: [
    {
      name: 'variant',
      type: 'enum',
      options: ['title', 'lead', 'body', 'small', 'muted'],
      default: 'body',
      description: 'Semantic role in the type scale.',
    },
    {
      name: 'size',
      type: 'enum',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Explicit font-size override (optional).',
    },
  ],
  cssVars: [
    {
      name: '--foreground',
      default: 'oklch(0.965 0.008 245)',
      description: 'Default text color.',
    },
    {
      name: '--muted-foreground',
      default: 'oklch(0.69 0.012 245)',
      description: 'Color for the `lead` and `muted` variants.',
    },
  ],
};
