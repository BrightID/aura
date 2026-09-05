import type { ComponentDoc } from '../_registry';

export type PropState = Record<string, string | boolean>;

/** Build the initial control state from a component's declared defaults. */
export function initialState(doc: ComponentDoc): PropState {
  const state: PropState = {};
  for (const p of doc.props) {
    state[p.name] =
      p.type === 'boolean' ? Boolean(p.default) : String(p.default ?? '');
  }
  return state;
}

/** Escape a value for use inside a double-quoted HTML attribute. */
function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;');
}

/**
 * Render a copy-pasteable custom-element snippet reflecting the current state.
 * Props equal to their default (and empty optional strings) are omitted.
 */
export function toSnippet(doc: ComponentDoc, state: PropState): string {
  const attrs: string[] = [];

  for (const p of doc.props) {
    const value = state[p.name];

    if (p.type === 'boolean') {
      if (value === true && p.default !== true) attrs.push(p.name);
      continue;
    }

    const str = String(value ?? '');
    const isDefault = str === String(p.default ?? '');
    if (str === '' || isDefault) continue;
    attrs.push(`${p.name}="${escapeAttr(str)}"`);
  }

  const slot = doc.slot ?? '';
  const attrsInline = attrs.length ? ` ${attrs.join(' ')}` : '';
  const openInline = `<${doc.tag}${attrsInline}>`;

  // Keep it on one line when it fits comfortably; otherwise stack attributes.
  if (openInline.length <= 68) {
    return `${openInline}${slot}</${doc.tag}>`;
  }

  const stacked = attrs.map((a) => `  ${a}`).join('\n');
  return `<${doc.tag}\n${stacked}\n>${slot}</${doc.tag}>`;
}
