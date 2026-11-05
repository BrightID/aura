import type { ComponentDoc, PropSpec } from '../_registry';

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

/** The attribute a prop renders as: its `attr`, or the `data-<name>` modifier. */
export function attrOf(p: PropSpec): string {
  return p.attr ?? `data-${p.name}`;
}

/**
 * The attributes for the current state, in order, as name → value. A boolean
 * that is on is '' (present), or 'true' for aria-* attributes. Empty strings
 * are left out, and so is a data-* modifier at its default, which aura.css
 * styles when the attribute is absent. A native attribute (one with `attr`)
 * stays at its default: the element's own default can differ (a <progress>
 * without value is indeterminate).
 */
export function attributes(
  doc: ComponentDoc,
  state: PropState,
): [string, string][] {
  const out: [string, string][] = [
    ['class', doc.className],
    ...Object.entries(doc.fixedAttrs ?? {}),
  ];
  for (const p of doc.props) {
    const value = state[p.name];
    const name = attrOf(p);
    if (p.type === 'boolean') {
      if (value === true && (p.attr || p.default !== true))
        out.push([name, name.startsWith('aria-') ? 'true' : '']);
      continue;
    }
    const str = String(value ?? '');
    if (str === '' || (!p.attr && str === String(p.default ?? ''))) continue;
    out.push([name, str]);
  }
  return out;
}

/** Render a copy-pasteable HTML snippet reflecting the current state. */
export function toSnippet(doc: ComponentDoc, state: PropState): string {
  const attrs = attributes(doc, state).map(([n, v]) =>
    v === '' ? n : `${n}="${escapeAttr(v)}"`,
  );
  const tag = doc.element;
  const before = doc.before ? `${doc.before}\n` : '';
  if (doc.inner) {
    const body = doc.inner
      .trim()
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n');
    return `${before}<${tag} ${attrs.join(' ')}>\n${body}\n</${tag}>`;
  }
  const close = doc.void ? ' />' : `>${doc.slot ?? ''}</${tag}>`;
  const inline = `<${tag} ${attrs.join(' ')}${close}`;

  // Keep it on one line when it fits comfortably; otherwise stack attributes.
  if (inline.length <= 72) return before + inline;
  const stacked = attrs.map((a) => `  ${a}`).join('\n');
  return `${before}<${tag}\n${stacked}\n${doc.void ? '/>' : `>${doc.slot ?? ''}</${tag}>`}`;
}
