export type ControlType = 'enum' | 'boolean' | 'string' | 'number';

export interface PropSpec {
  /** Control name shown in the playground, e.g. "variant". */
  name: string;
  /**
   * Attribute it renders as. Defaults to `data-<name>`, the aura.css modifier;
   * set it for native attributes such as "disabled" or "placeholder".
   */
  attr?: string;
  type: ControlType;
  /** Allowed values for `enum` controls. */
  options?: string[];
  /** Default value; omitted from snippets only for data-* modifiers (no `attr`). */
  default?: string | boolean | number;
  description: string;
}

export interface CssVarSpec {
  /** Custom property name including leading dashes, e.g. "--primary". */
  name: string;
  /** Default value, from @aura/ui/tokens.css. */
  default: string;
  description: string;
}

export interface ComponentDoc {
  /** URL slug and registry key, e.g. "button". */
  slug: string;
  /** Human name, e.g. "Button". */
  name: string;
  /** Native element to render, e.g. "button". */
  element: string;
  /** aura.css class, e.g. "a-button". */
  className: string;
  /** Attributes every use needs, e.g. { type: 'button' }. */
  fixedAttrs?: Record<string, string>;
  /** A void element such as <input>: no content, no closing tag. */
  void?: boolean;
  /** HTML inside the element, for composites such as tabs or a menu. */
  inner?: string;
  /**
   * Attributes for the live preview only, e.g. { open: '' } to show a dialog
   * in place; null drops one of `fixedAttrs`, e.g. { popover: null }.
   */
  previewAttrs?: Record<string, string | null>;
  /** Snippet-only markup before the element, e.g. the button that opens it. */
  before?: string;
  description: string;
  props: PropSpec[];
  cssVars: CssVarSpec[];
  /** Text content inside the element, in the live preview and the snippet. */
  slot?: string;
  /**
   * How the live preview frames the element: "center" (the default) centers
   * it; "block" gives a full-width block;
   * "contain" also keeps position: fixed overlays (dialog, sheet) inside the
   * preview.
   */
  frame?: 'center' | 'block' | 'contain';
}
