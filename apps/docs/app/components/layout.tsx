import Link from 'next/link';
import { registry } from './_registry';

const sectionLinkBase =
  'block rounded-md px-2.5 py-1.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground';

export default function ComponentsDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen font-[family-name:var(--font-geist-sans)]">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-7 overflow-y-auto border-r border-border px-5 py-7 max-md:hidden">
        <Link href="/" className="flex items-center gap-2 px-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            A
          </span>
          <span className="text-sm font-semibold text-foreground">Aura UI</span>
        </Link>

        {/* Section switcher */}
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <span className="flex-1 rounded-md bg-muted px-2.5 py-1 text-center text-xs font-medium text-foreground">
            Components
          </span>
          <Link
            href="/query"
            className="flex-1 rounded-md px-2.5 py-1 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Query
          </Link>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="mb-1 pl-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Overview
          </p>
          <Link href="/components" className={sectionLinkBase}>
            Introduction
          </Link>
        </nav>

        <nav className="flex flex-col gap-1">
          <p className="mb-1 pl-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Components
          </p>
          {registry.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className={sectionLinkBase}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="mx-auto min-w-0 max-w-[820px] flex-1 px-14 py-12 max-md:px-6 max-md:py-8">
        {children}
      </main>
    </div>
  );
}
