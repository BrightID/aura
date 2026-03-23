import Link from "next/link";

const nav = [
  {
    label: "Getting Started",
    links: [
      { href: "/query", label: "Introduction" },
      { href: "/query/query-client", label: "QueryClient" },
    ],
  },
  {
    label: "Controllers",
    links: [
      { href: "/query/queries", label: "Query" },
      { href: "/query/mutations", label: "Mutation" },
    ],
  },
  {
    label: "Reference",
    links: [{ href: "/query/api-reference", label: "API Reference" }],
  },
];

export default function QueryDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen font-[family-name:var(--font-geist-sans)]">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-8 overflow-y-auto border-r border-black/[0.08] px-5 py-8 dark:border-white/[0.08] max-md:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-black/40 dark:text-white/40">
          <span className="text-foreground">@aura</span>/query
        </p>
        {nav.map((section) => (
          <nav key={section.label} className="flex flex-col gap-1">
            <p className="mb-2 pl-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-black/40 dark:text-white/40">
              {section.label}
            </p>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-2.5 py-1.5 text-sm text-black/60 transition-colors hover:bg-black/5 hover:text-foreground dark:text-white/60 dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </aside>

      <main className="mx-auto min-w-0 max-w-[760px] flex-1 px-14 py-12 max-md:px-6 max-md:py-8">
        {children}
      </main>
    </div>
  );
}
