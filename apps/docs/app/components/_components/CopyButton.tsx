"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-[color-mix(in_oklch,var(--border)_70%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)] hover:text-[var(--foreground)]"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
