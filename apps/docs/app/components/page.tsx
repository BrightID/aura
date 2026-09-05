import Link from 'next/link';
import { registry } from './_registry';

export default function ComponentsIndex() {
  return (
    <div className="prose">
      <h1>Components</h1>
      <p className="prose-lead">
        Aura&apos;s UI kit is a set of framework-agnostic web components. Every
        component below has a live playground — tweak its props and theme
        variables, then copy the generated markup.
      </p>

      <div className="not-prose mt-8 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {registry.map((c) => (
          <Link
            key={c.slug}
            href={`/components/${c.slug}`}
            className="group rounded-xl border border-[color-mix(in_oklch,var(--border)_70%,transparent)] p-5 transition-colors hover:border-[var(--primary)]"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-[var(--foreground)]">
                {c.name}
              </span>
              <code className="font-[family-name:var(--font-geist-mono)] text-[0.7rem] text-[var(--muted-foreground)]">
                &lt;{c.tag}&gt;
              </code>
            </div>
            <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
