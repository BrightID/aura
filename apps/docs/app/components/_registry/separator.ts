import type { ComponentDoc } from './types';

export const separator: ComponentDoc = {
  slug: 'separator',
  name: 'Separator',
  element: 'hr',
  className: 'a-separator',
  void: true,
  description:
    'A thin rule that divides content. Switch `orientation` for horizontal or vertical layouts.',
  frame: 'block',
  props: [
    {
      name: 'orientation',
      type: 'enum',
      options: ['horizontal', 'vertical'],
      default: 'horizontal',
      description:
        'Direction of the rule. Vertical needs a height-constrained container.',
    },
  ],
  cssVars: [
    {
      name: '--border',
      default: 'oklch(0.305 0.018 244)',
      description: 'Rule color.',
    },
  ],
};
