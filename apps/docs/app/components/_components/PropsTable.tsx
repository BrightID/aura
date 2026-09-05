import type { ComponentDoc } from '../_registry';
import { Table } from '../../query/_components/Code';

export function PropsTable({ doc }: { doc: ComponentDoc }) {
  return (
    <Table
      headers={['Prop', 'Type', 'Default', 'Description']}
      rows={doc.props.map((p) => [
        <code key="n">{p.name}</code>,
        p.type === 'enum' && p.options ? (
          <code key="t">{p.options.map((o) => `"${o}"`).join(' | ')}</code>
        ) : (
          <code key="t">{p.type}</code>
        ),
        p.default === undefined || p.default === '' ? (
          <span key="d">—</span>
        ) : (
          <code key="d">{String(p.default)}</code>
        ),
        <span key="desc">{p.description}</span>,
      ])}
    />
  );
}

export function CssVarTable({ doc }: { doc: ComponentDoc }) {
  return (
    <Table
      headers={['Variable', 'Default', 'Description']}
      rows={doc.cssVars.map((v) => [
        <code key="n">{v.name}</code>,
        <code key="d">{v.default}</code>,
        <span key="desc">{v.description}</span>,
      ])}
    />
  );
}
