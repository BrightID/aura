'use client';

import type React from 'react';
import '@aura/ui';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <a-theme-provider
      style={{
        display: 'block',
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {children}
    </a-theme-provider>
  );
}
