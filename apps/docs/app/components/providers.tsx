import type React from 'react';

/** The component pages' wrapper. Theme tokens come from aura.css, on :root. */
export function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div className="min-h-screen">{children}</div>;
}
