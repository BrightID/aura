interface CodeProps {
  lang?: string;
  filename?: string;
  children: string;
}

export function Code({ lang = "ts", filename, children }: CodeProps) {
  return (
    <div className="my-5 overflow-hidden rounded-[10px] border border-black/[0.08] dark:border-white/[0.08]">
      <div className="flex items-center justify-between border-b border-black/[0.08] bg-black/[0.04] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-xs text-black/50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50">
        <span>{filename ?? lang}</span>
      </div>
      <pre className="m-0 overflow-x-auto bg-black/[0.03] p-5 dark:bg-white/[0.03]">
        <code className="font-[family-name:var(--font-geist-mono)] text-[0.825rem] leading-[1.65] [tab-size:2]">
          {children.trim()}
        </code>
      </pre>
    </div>
  );
}

interface CalloutProps {
  type?: "note" | "tip" | "warn";
  children: React.ReactNode;
}

const icons = { note: "ℹ", tip: "✦", warn: "⚠" };
const variants = {
  note: "bg-blue-500/[0.08] border border-blue-500/20 text-blue-500/90",
  tip: "bg-green-500/[0.08] border border-green-500/20 text-green-500/90",
  warn: "bg-yellow-500/[0.08] border border-yellow-500/20 text-yellow-500/90",
};

export function Callout({ type = "note", children }: CalloutProps) {
  return (
    <div className={`my-5 flex gap-3 rounded-lg px-4 py-3.5 text-sm leading-relaxed ${variants[type]}`}>
      <span className="shrink-0 text-base">{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}

interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
}

export function Table({ headers, rows }: TableProps) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-black/[0.1] bg-black/[0.04] px-3.5 py-2 text-left text-[0.8rem] font-semibold uppercase tracking-[0.05em] text-black/60 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/60"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border-b border-black/[0.06] px-3.5 py-2 align-top text-black/75 first:[&>code]:font-[family-name:var(--font-geist-mono)] first:[&>code]:text-[0.8rem] first:[&>code]:text-foreground dark:border-white/[0.06] dark:text-white/75"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
