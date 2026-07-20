export type ControlType = "enum" | "boolean" | "string" | "number";

export interface PropSpec {
  /** Attribute name on the custom element, e.g. "variant". */
  name: string;
  type: ControlType;
  /** Allowed values for `enum` controls. */
  options?: string[];
  /** Default value — omitted from generated snippets. */
  default?: string | boolean | number;
  description: string;
}

export interface CssVarSpec {
  /** Custom property name including leading dashes, e.g. "--primary". */
  name: string;
  /** Default value as defined by the theme provider. */
  default: string;
  description: string;
}

export interface ComponentDoc {
  /** URL slug and registry key, e.g. "button". */
  slug: string;
  /** Human name, e.g. "Button". */
  name: string;
  /** Custom element tag, e.g. "a-button". */
  tag: string;
  description: string;
  props: PropSpec[];
  cssVars: CssVarSpec[];
  /** Default slot text rendered inside the live preview. */
  slot?: string;
  /**
   * When rendering the live preview, wrap the element so it is visible.
   * "center" (default) centers it; "block" gives a full-width block.
   */
  frame?: "center" | "block";
}
