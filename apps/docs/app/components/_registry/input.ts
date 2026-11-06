import type { ComponentDoc } from './types';

export const input: ComponentDoc = {
  slug: 'input',
  name: 'Input',
  element: 'input',
  className: 'a-input',
  void: true,
  description:
    'Text field with an optional label and prefix/suffix slots. Fully self-contained — no slot content required.',
  frame: 'block',
  props: [
    {
      name: 'type',
      attr: 'type',
      type: 'enum',
      options: ['text', 'email', 'password', 'number'],
      default: 'text',
      description: 'Native input type.',
    },
    {
      name: 'placeholder',
      attr: 'placeholder',
      type: 'string',
      default: '',
      description: 'Placeholder text.',
    },
    {
      name: 'value',
      attr: 'value',
      type: 'string',
      default: '',
      description: 'Current value (reflected).',
    },
    {
      name: 'name',
      attr: 'name',
      type: 'string',
      default: '',
      description: 'Form field name.',
    },
    {
      name: 'disabled',
      attr: 'disabled',
      type: 'boolean',
      default: false,
      description: 'Disables the field.',
    },
  ],
  cssVars: [
    {
      name: '--input',
      default: 'oklch(0.225 0.018 244)',
      description: 'Input surface color.',
    },
    {
      name: '--border',
      default: 'oklch(0.305 0.018 244)',
      description: 'Border color.',
    },
    {
      name: '--muted-foreground',
      default: 'oklch(0.69 0.012 245)',
      description: 'Label and placeholder color.',
    },
    { name: '--radius', default: '0.625rem', description: 'Corner radius.' },
  ],
};
