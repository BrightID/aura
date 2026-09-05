import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Playground } from '../_components/Playground';
import { CssVarTable, PropsTable } from '../_components/PropsTable';
import { getComponent, registry } from '../_registry';

export function generateStaticParams() {
  return registry.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getComponent(slug);
  return { title: doc ? `${doc.name} — Aura UI` : 'Aura UI' };
}

function renderInline(text: string): ReactNode[] {
  return text
    .split(/(`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith('`') && part.endsWith('`') ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getComponent(slug);
  if (!doc) notFound();

  return (
    <div className="prose">
      <h1>{doc.name}</h1>
      <p className="prose-lead">{renderInline(doc.description)}</p>

      <div className="not-prose">
        <Playground doc={doc} />
      </div>

      <h2>Props</h2>
      <div className="not-prose">
        <PropsTable doc={doc} />
      </div>

      <h2>Theme variables</h2>
      <p>
        These CSS custom properties are inherited from{' '}
        <code>&lt;a-theme-provider&gt;</code>. Override them on any ancestor —
        or live in the <strong>Theme</strong> tab above — to restyle the
        component.
      </p>
      <div className="not-prose">
        <CssVarTable doc={doc} />
      </div>
    </div>
  );
}
