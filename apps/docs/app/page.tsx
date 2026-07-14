import Link from "next/link";
import type { ReactNode } from "react";

export default function Home(): ReactNode {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-20 text-center font-[family-name:var(--font-geist-sans)]">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
        A
      </span>

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-bold tracking-[-0.03em] text-foreground max-sm:text-3xl">
          Aura UI
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
          A framework-agnostic component kit built on web components. Explore every component with a
          live, themeable playground.
        </p>
      </div>

      <div className="flex gap-3 max-sm:flex-col">
        <Link
          href="/components"
          className="flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Browse components →
        </Link>
        <Link
          href="/query"
          className="flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          @aura/query docs
        </Link>
      </div>
    </div>
  );
}
