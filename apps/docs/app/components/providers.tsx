"use client";

import type React from "react";
import "@aura/ui";

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return <a-theme-provider>{children}</a-theme-provider>;
}
