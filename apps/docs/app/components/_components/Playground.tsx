'use client';

import { createElement, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ComponentDoc } from '../_registry';
import { Code } from '../../query/_components/Code';
import { Controls } from './Controls';
import { CopyButton } from './CopyButton';
import { CssVarsPanel, type CssVarState } from './CssVarsPanel';
import { attributes, initialState, type PropState, toSnippet } from './snippet';

type Tab = 'props' | 'theme';

/** "height: 1rem; --x: 2" as a React style object; custom properties keep their name. */
function styleObject(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = decl.slice(i + 1).trim();
  }
  return out;
}

/** React props for the live element: the snippet's attributes, as props. */
export function liveProps(
  doc: ComponentDoc,
  state: PropState,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [name, value] of attributes(doc, state)) {
    if (name === 'class') props.className = value;
    else if (name === 'style') props.style = styleObject(value);
    // A form field stays uncontrolled: React only lets `value` change with an
    // onChange. Other elements (<progress>) take `value`; React ignores
    // defaultValue on them.
    else if (
      name === 'value' &&
      ['input', 'textarea', 'select'].includes(doc.element)
    )
      props.defaultValue = value;
    else if (name === 'checked') props.defaultChecked = true;
    else if (name.startsWith('data-') || name.startsWith('aria-'))
      props[name] = value;
    else props[name] = value === '' ? true : value;
  }
  for (const [name, value] of Object.entries(doc.previewAttrs ?? {})) {
    if (value === null) delete props[name];
    else props[name] = value === '' ? true : value;
  }
  return props;
}

function defaultCssVars(doc: ComponentDoc): CssVarState {
  const out: CssVarState = {};
  for (const v of doc.cssVars) out[v.name] = v.default;
  return out;
}

export function Playground({ doc }: { doc: ComponentDoc }) {
  const [state, setState] = useState<PropState>(() => initialState(doc));
  const [cssVars, setCssVars] = useState<CssVarState>(() =>
    defaultCssVars(doc),
  );
  const [tab, setTab] = useState<Tab>('props');

  const snippet = useMemo(() => toSnippet(doc, state), [doc, state]);
  const element = createElement(
    doc.element,
    // Remount when the snippet changes, so defaultValue takes effect.
    {
      ...liveProps(doc, state),
      key: snippet,
      ...(doc.inner && { dangerouslySetInnerHTML: { __html: doc.inner } }),
    },
    doc.inner ? undefined : doc.void ? undefined : doc.slot,
  );

  const previewStyle: CSSProperties = {
    ...(cssVars as CSSProperties),
    backgroundColor: 'var(--background)',
    backgroundImage:
      'radial-gradient(color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px)',
    backgroundSize: '16px 16px',
  };
  const frame = doc.frame ?? 'center';
  const centered = frame !== 'block';
  // A transformed ancestor is the containing block for position: fixed, so a
  // dialog or sheet stays inside the preview instead of covering the page.
  if (frame === 'contain') previewStyle.transform = 'translateZ(0)';

  return (
    <div className="my-6">
      <div className="overflow-hidden rounded-xl border border-border shadow-[0_1px_2px_oklch(0_0_0/0.2),0_12px_32px_oklch(0_0_0/0.25)]">
        {/* Live preview */}
        <div
          style={previewStyle}
          className={`flex gap-4 border-b border-border p-10 ${
            frame === 'contain'
              ? 'min-h-[360px] overflow-hidden'
              : 'min-h-[260px]'
          } ${
            centered ? 'items-center justify-center' : 'flex-col justify-center'
          }`}
        >
          {element}
        </div>

        {/* Controls */}
        <div className="bg-card p-5">
          <div className="mb-3 flex items-center gap-1">
            <TabButton active={tab === 'props'} onClick={() => setTab('props')}>
              Props
            </TabButton>
            <TabButton active={tab === 'theme'} onClick={() => setTab('theme')}>
              Theme
            </TabButton>
            <div className="ml-auto">
              {tab === 'props' ? (
                <button
                  type="button"
                  onClick={() => setState(initialState(doc))}
                  className="text-xs font-medium text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          {tab === 'props' ? (
            <Controls
              doc={doc}
              state={state}
              onChange={(name, value) =>
                setState((s) => ({ ...s, [name]: value }))
              }
            />
          ) : (
            <CssVarsPanel
              vars={doc.cssVars}
              values={cssVars}
              onChange={(name, value) =>
                setCssVars((s) => ({ ...s, [name]: value }))
              }
              onReset={() => setCssVars(defaultCssVars(doc))}
            />
          )}
        </div>
      </div>

      {/* Generated snippet */}
      <div className="relative">
        <div className="absolute right-3 top-3 z-10">
          <CopyButton value={snippet} />
        </div>
        <Code lang="html" filename={`${doc.slug}.html`}>
          {snippet}
        </Code>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-[color-mix(in_oklch,var(--foreground)_10%,transparent)] text-[var(--foreground)]'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      }`}
    >
      {children}
    </button>
  );
}
