"use client";

import { createElement, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ComponentDoc } from "../_registry";
import { Code } from "../../query/_components/Code";
import { Controls } from "./Controls";
import { CopyButton } from "./CopyButton";
import { CssVarsPanel, type CssVarState } from "./CssVarsPanel";
import { initialState, type PropState, toSnippet } from "./snippet";

type Tab = "props" | "theme";

/** Build the props object handed to the live custom element. */
function liveProps(doc: ComponentDoc, state: PropState): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const p of doc.props) {
    const value = state[p.name];
    if (p.type === "boolean") {
      if (value === true) props[p.name] = true;
      continue;
    }
    const str = String(value ?? "");
    if (str !== "") props[p.name] = str;
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
  const [cssVars, setCssVars] = useState<CssVarState>(() => defaultCssVars(doc));
  const [tab, setTab] = useState<Tab>("props");

  const snippet = useMemo(() => toSnippet(doc, state), [doc, state]);
  const element = createElement(doc.tag, liveProps(doc, state), doc.slot);

  const previewStyle: CSSProperties = {
    ...(cssVars as CSSProperties),
    backgroundColor: "var(--background)",
    backgroundImage:
      "radial-gradient(color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  };
  const centered = (doc.frame ?? "center") === "center";

  return (
    <div className="my-6">
      <div className="overflow-hidden rounded-xl border border-border shadow-[0_1px_2px_oklch(0_0_0/0.2),0_12px_32px_oklch(0_0_0/0.25)]">
        {/* Live preview */}
        <div
          style={previewStyle}
          className={`flex min-h-[260px] gap-4 border-b border-border p-10 ${
            centered ? "items-center justify-center" : "flex-col justify-center"
          }`}
        >
          {element}
        </div>

        {/* Controls */}
        <div className="bg-card p-5">
          <div className="mb-3 flex items-center gap-1">
            <TabButton active={tab === "props"} onClick={() => setTab("props")}>
              Props
            </TabButton>
            <TabButton active={tab === "theme"} onClick={() => setTab("theme")}>
              Theme
            </TabButton>
            <div className="ml-auto">
              {tab === "props" ? (
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

          {tab === "props" ? (
            <Controls
              doc={doc}
              state={state}
              onChange={(name, value) => setState((s) => ({ ...s, [name]: value }))}
            />
          ) : (
            <CssVarsPanel
              vars={doc.cssVars}
              values={cssVars}
              onChange={(name, value) => setCssVars((s) => ({ ...s, [name]: value }))}
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
        <Code lang="html" filename={`${doc.tag}.html`}>
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
          ? "bg-[color-mix(in_oklch,var(--foreground)_10%,transparent)] text-[var(--foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
