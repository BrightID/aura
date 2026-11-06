/** Registry entries for the aura.css classes that have no file of their own in this folder. */
import type { ComponentDoc } from './types';

export const headDoc: ComponentDoc = {
  slug: 'head',
  name: 'Heading',
  element: 'h2',
  className: 'a-head',
  description:
    'A heading. Use the HTML level that fits the outline; `data-level` only sets the size (2 when unset).',
  slot: 'Section title',
  frame: 'block',
  props: [
    {
      name: 'level',
      description: 'Size, from 1 (largest) to 6.',
      type: 'enum',
      options: ['1', '2', '3', '4', '5', '6'],
      default: '2',
    },
  ],
  cssVars: [],
};

export const labelDoc: ComponentDoc = {
  slug: 'label',
  name: 'Label',
  element: 'label',
  className: 'a-label',
  description: 'A form label. Point `for` at the control it names.',
  slot: 'Email address',
  frame: 'center',
  props: [],
  cssVars: [],
};

export const fieldDoc: ComponentDoc = {
  slug: 'field',
  name: 'Field',
  element: 'label',
  className: 'a-field',
  description:
    'A label with its input inside, stacked: the label text above, the field below.',
  inner:
    'Email\n<input class="a-input" type="email" placeholder="you@example.com" />',
  frame: 'block',
  props: [],
  cssVars: [
    {
      name: '--muted-foreground',
      description: 'Secondary text color.',
      default: 'oklch(0.69 0.012 245)',
    },
    {
      name: '--border',
      description: 'Border color.',
      default: 'oklch(0.305 0.018 244)',
    },
  ],
};

export const inputGroupDoc: ComponentDoc = {
  slug: 'input-group',
  name: 'Input group',
  element: 'div',
  className: 'a-input-group',
  description:
    'An input with a leading icon. Any child that is not the `.a-input` is placed inside the field, on the left.',
  inner:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>\n<input class="a-input" placeholder="Search\u2026" />',
  frame: 'block',
  props: [],
  cssVars: [
    {
      name: '--muted-foreground',
      description: 'Secondary text color.',
      default: 'oklch(0.69 0.012 245)',
    },
  ],
};

export const switchDoc: ComponentDoc = {
  slug: 'switch',
  name: 'Switch',
  element: 'input',
  className: 'a-switch',
  fixedAttrs: {
    type: 'checkbox',
    role: 'switch',
  },
  void: true,
  description:
    'An on/off control: a native checkbox with `role="switch"`, so forms, labels and keyboard work as usual.',
  frame: 'center',
  props: [
    {
      name: 'checked',
      description: 'On.',
      attr: 'checked',
      type: 'boolean',
      default: false,
    },
    {
      name: 'disabled',
      description: 'Dims it and blocks input.',
      attr: 'disabled',
      type: 'boolean',
      default: false,
    },
  ],
  cssVars: [
    {
      name: '--primary',
      description: 'Primary palette base color.',
      default: 'oklch(0.69 0.14 182)',
    },
    {
      name: '--input',
      description: 'Track color for switches.',
      default: 'oklch(0.225 0.018 244)',
    },
  ],
};

export const sliderDoc: ComponentDoc = {
  slug: 'slider',
  name: 'Slider',
  element: 'input',
  className: 'a-slider',
  fixedAttrs: {
    type: 'range',
    value: '40',
    style: '--_pct: 40%',
  },
  void: true,
  description:
    "A native range input. Set `--_pct` to the value as a percentage of the range: CSS cannot read an input's value, and the track fill needs it.",
  frame: 'block',
  props: [
    {
      name: 'disabled',
      description: 'Dims it and blocks input.',
      attr: 'disabled',
      type: 'boolean',
      default: false,
    },
  ],
  cssVars: [
    {
      name: '--primary',
      description: 'Primary palette base color.',
      default: 'oklch(0.69 0.14 182)',
    },
    {
      name: '--muted',
      description: 'Muted surface color.',
      default: 'oklch(0.235 0.018 244)',
    },
  ],
};

export const toggleDoc: ComponentDoc = {
  slug: 'toggle',
  name: 'Toggle',
  element: 'button',
  className: 'a-toggle',
  fixedAttrs: {
    type: 'button',
  },
  description:
    'A button that stays pressed. Group several in a `.a-toggle-group`.',
  slot: 'Bold',
  frame: 'center',
  props: [
    {
      name: 'variant',
      description: 'Transparent, or with a border.',
      type: 'enum',
      options: ['default', 'outline'],
      default: 'default',
    },
    {
      name: 'size',
      description: 'Height and padding.',
      type: 'enum',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    {
      name: 'pressed',
      description: 'Pressed state.',
      attr: 'aria-pressed',
      type: 'boolean',
      default: false,
    },
  ],
  cssVars: [
    {
      name: '--accent',
      description: 'Hover surface for menu items and toggles.',
      default: 'oklch(0.665 0.12 226)',
    },
  ],
};

export const tabsDoc: ComponentDoc = {
  slug: 'tabs',
  name: 'Tabs',
  element: 'div',
  className: 'a-tabs',
  fixedAttrs: {
    role: 'tablist',
  },
  description:
    'A tab bar. Mark the current tab with `aria-selected="true"`; the app shows the matching panel (`.a-tab-panel`).',
  inner:
    '<button class="a-tab" type="button" role="tab" aria-selected="true">Overview</button>\n<button class="a-tab" type="button" role="tab" aria-selected="false">Activity</button>\n<button class="a-tab" type="button" role="tab" aria-selected="false">Settings</button>',
  frame: 'block',
  props: [
    {
      name: 'compact',
      description: 'An underlined row instead of a filled bar.',
      type: 'boolean',
      default: false,
    },
  ],
  cssVars: [
    {
      name: '--primary',
      description: 'Primary palette base color.',
      default: 'oklch(0.69 0.14 182)',
    },
    {
      name: '--muted-foreground',
      description: 'Secondary text color.',
      default: 'oklch(0.69 0.012 245)',
    },
  ],
};

export const skeletonDoc: ComponentDoc = {
  slug: 'skeleton',
  name: 'Skeleton',
  element: 'div',
  className: 'a-skeleton',
  fixedAttrs: {
    style: 'height: 1.25rem',
  },
  description:
    'A pulsing placeholder while content loads. Size it with width and height.',
  frame: 'block',
  props: [],
  cssVars: [
    {
      name: '--muted',
      description: 'Muted surface color.',
      default: 'oklch(0.235 0.018 244)',
    },
    {
      name: '--radius',
      description: 'Corner radius.',
      default: '0.625rem',
    },
  ],
};

export const progressDoc: ComponentDoc = {
  slug: 'progress',
  name: 'Progress',
  element: 'progress',
  className: 'a-progress',
  fixedAttrs: {
    max: '100',
  },
  description: 'A native `<progress>` bar.',
  frame: 'block',
  props: [
    {
      name: 'value',
      description: 'Progress out of `max`.',
      attr: 'value',
      type: 'number',
      default: '60',
    },
  ],
  cssVars: [
    {
      name: '--primary',
      description: 'Primary palette base color.',
      default: 'oklch(0.69 0.14 182)',
    },
    {
      name: '--muted',
      description: 'Muted surface color.',
      default: 'oklch(0.235 0.018 244)',
    },
  ],
};

export const avatarDoc: ComponentDoc = {
  slug: 'avatar',
  name: 'Avatar',
  element: 'span',
  className: 'a-avatar',
  description:
    'A round picture. Put an `<img>` inside, or initials when there is none.',
  slot: 'AB',
  frame: 'center',
  props: [
    {
      name: 'size',
      description: 'Diameter.',
      type: 'enum',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
  ],
  cssVars: [
    {
      name: '--muted',
      description: 'Muted surface color.',
      default: 'oklch(0.235 0.018 244)',
    },
    {
      name: '--muted-foreground',
      description: 'Secondary text color.',
      default: 'oklch(0.69 0.012 245)',
    },
  ],
};

export const dialogDoc: ComponentDoc = {
  slug: 'dialog',
  name: 'Dialog',
  element: 'dialog',
  className: 'a-dialog',
  fixedAttrs: {
    id: 'dialog',
    'aria-label': 'Example',
  },
  previewAttrs: {
    open: '',
  },
  before:
    '<button class="a-button" type="button" onclick="dialog.showModal()">Open</button>',
  description:
    'A native modal `<dialog>`: open it with `showModal()`, close it with `close()` or Esc. The page behind stops scrolling while it is open.',
  inner:
    '<p>Dialog content goes here.</p>\n<button class="a-dialog-close" type="button" aria-label="Close dialog" onclick="dialog.close()">\u00d7</button>',
  frame: 'contain',
  props: [],
  cssVars: [
    {
      name: '--background',
      description: 'Page and dialog background.',
      default: 'oklch(0.145 0.014 238)',
    },
    {
      name: '--border',
      description: 'Border color.',
      default: 'oklch(0.305 0.018 244)',
    },
    {
      name: '--radius',
      description: 'Corner radius.',
      default: '0.625rem',
    },
  ],
};

export const sheetDoc: ComponentDoc = {
  slug: 'sheet',
  name: 'Sheet',
  element: 'dialog',
  className: 'a-sheet',
  fixedAttrs: {
    id: 'sheet',
    'aria-label': 'Example',
  },
  previewAttrs: {
    open: '',
  },
  before:
    '<button class="a-button" type="button" onclick="sheet.showModal()">Open</button>',
  description: 'A `<dialog>` that slides in from an edge.',
  inner: '<p>Sheet content.</p>',
  frame: 'contain',
  props: [
    {
      name: 'side',
      description: 'The edge it slides in from.',
      type: 'enum',
      options: ['right', 'left', 'top', 'bottom'],
      default: 'right',
    },
  ],
  cssVars: [
    {
      name: '--card',
      description: 'Card surface color.',
      default: 'oklch(0.19 0.018 238)',
    },
    {
      name: '--border',
      description: 'Border color.',
      default: 'oklch(0.305 0.018 244)',
    },
  ],
};

export const menuDoc: ComponentDoc = {
  slug: 'menu',
  name: 'Menu',
  element: 'div',
  className: 'a-menu',
  fixedAttrs: {
    id: 'menu',
    popover: '',
  },
  previewAttrs: {
    popover: null,
  },
  before:
    '<button class="a-button" type="button" popovertarget="menu">Open</button>',
  description:
    'A popover menu. The `popover` attribute and a `popovertarget` button open and close it, with no JavaScript; position it yourself.',
  inner:
    '<div class="a-menu-label">Account</div>\n<button class="a-menu-item" type="button">Profile</button>\n<button class="a-menu-item" type="button">Billing</button>\n<hr class="a-menu-separator" />\n<button class="a-menu-item" type="button" data-variant="destructive">Log out</button>',
  frame: 'center',
  props: [],
  cssVars: [
    {
      name: '--popover',
      description: 'Popover and menu surface.',
      default: 'oklch(0.175 0.018 238)',
    },
    {
      name: '--accent',
      description: 'Hover surface for menu items and toggles.',
      default: 'oklch(0.665 0.12 226)',
    },
    {
      name: '--destructive',
      description: 'Destructive palette base color.',
      default: 'oklch(0.62 0.2 25)',
    },
  ],
};

export const popoverDoc: ComponentDoc = {
  slug: 'popover',
  name: 'Popover',
  element: 'div',
  className: 'a-popover',
  fixedAttrs: {
    id: 'popover',
    popover: '',
  },
  previewAttrs: {
    popover: null,
  },
  before:
    '<button class="a-button" type="button" popovertarget="popover">Open</button>',
  description:
    'A floating panel. With `data-tooltip` it is a small text label.',
  slot: 'Popover content.',
  frame: 'center',
  props: [
    {
      name: 'tooltip',
      description: 'Tooltip size and padding.',
      type: 'boolean',
      default: false,
    },
  ],
  cssVars: [
    {
      name: '--popover',
      description: 'Popover and menu surface.',
      default: 'oklch(0.175 0.018 238)',
    },
    {
      name: '--border',
      description: 'Border color.',
      default: 'oklch(0.305 0.018 244)',
    },
  ],
};

export const toastDoc: ComponentDoc = {
  slug: 'toast',
  name: 'Toast',
  element: 'div',
  className: 'a-toast',
  fixedAttrs: {
    role: 'status',
  },
  description:
    'A notification. The apps render the `@aura/ui/toast` store with these; the close button dismisses it from the keyboard.',
  inner:
    'Settings saved\n<button class="a-toast-close" type="button" aria-label="Dismiss">\u00d7</button>',
  frame: 'center',
  props: [
    {
      name: 'variant',
      description: 'Border color.',
      type: 'enum',
      options: ['default', 'success', 'warning', 'info', 'error'],
      default: 'default',
    },
  ],
  cssVars: [
    {
      name: '--popover',
      description: 'Popover and menu surface.',
      default: 'oklch(0.175 0.018 238)',
    },
    {
      name: '--aura-success',
      description: 'Success color.',
      default: 'oklch(0.7 0.15 154)',
    },
    {
      name: '--destructive',
      description: 'Destructive palette base color.',
      default: 'oklch(0.62 0.2 25)',
    },
  ],
};
