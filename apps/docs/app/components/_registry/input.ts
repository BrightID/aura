import type { ComponentDoc } from './types';

export const input: ComponentDoc = {
  slug: 'input',
  name: 'Input',
  tag: 'a-input',
  description:
    'Text field with an optional label and prefix/suffix slots. Fully self-contained — no slot content required.',
  frame: 'block',
  props: [
    {
      name: 'type',
      type: 'enum',
      options: ['text', 'email', 'password', 'number'],
      default: 'text',
      description: 'Native input type.',
    },
    {
      name: 'label',
      type: 'string',
      default: '',
      description: 'Label rendered above the field.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: '',
      description: 'Placeholder text.',
    },
    {
      name: 'value',
      type: 'string',
      default: '',
      description: 'Current value (reflected).',
    },
    {
      name: 'name',
      type: 'string',
      default: 'input-text',
      description: 'Form field name.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'Disables the field.',
    },
  ],
  cssVars: [
    {
      name: '--input',
      default: 'oklch(0.20 0.015 265)',
      description: 'Input surface color.',
    },
    {
      name: '--border',
      default: 'oklch(0.27 0.018 265)',
      description: 'Border color.',
    },
    {
      name: '--muted-foreground',
      default: 'oklch(0.58 0.01 265)',
      description: 'Label and placeholder color.',
    },
    { name: '--radius', default: '0.75rem', description: 'Corner radius.' },
  ],
};
