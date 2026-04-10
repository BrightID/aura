import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-theme-provider")
export class ThemeProvider extends LitElement {
  static styles?: CSSResultGroup = css`
    :host,
    ::slotted(*) {
      --xs: 0.5rem;
      --sm: 0.75rem;
      --md: 1rem;
      --lg: 1.25rem;
      --xl: 1.5rem;
      --xl2: 2rem;
      --background: oklch(0.13 0.01 260);
      --foreground: oklch(0.98 0 0);
      --card: oklch(0.18 0.015 260);
      --card-foreground: oklch(0.98 0 0);
      --popover: oklch(0.16 0.012 260);
      --popover-foreground: oklch(0.98 0 0);
      --primary: oklch(0.72 0.18 150);
      --primary-foreground: oklch(0.13 0.01 260);
      --secondary: oklch(0.25 0.02 260);
      --secondary-foreground: oklch(0.85 0 0);
      --muted: oklch(0.22 0.015 260);
      --muted-foreground: oklch(0.65 0 0);
      --accent: oklch(0.65 0.16 200);
      --accent-foreground: oklch(0.98 0 0);
      --destructive: oklch(0.55 0.22 25);
      --destructive-foreground: oklch(0.98 0 0);
      --border: oklch(0.28 0.02 260);
      --input: oklch(0.22 0.015 260);
      --ring: oklch(0.72 0.18 150);
      --chart-1: oklch(0.72 0.18 150);
      --chart-2: oklch(0.65 0.16 200);
      --chart-3: oklch(0.6 0.14 280);
      --chart-4: oklch(0.75 0.15 80);
      --chart-5: oklch(0.55 0.22 25);
      --radius: 0.75rem;

      --aura-success: oklch(0.72 0.18 150);
      --aura-warning: oklch(0.78 0.16 80);
      --aura-info: oklch(0.65 0.16 200);
      --aura-level-1: oklch(0.65 0.12 90);
      --aura-level-2: oklch(0.65 0.16 200);
      --aura-level-3: oklch(0.72 0.18 150);
      --sidebar: oklch(0.985 0 0);
      --sidebar-foreground: oklch(0.145 0 0);
      --sidebar-primary: oklch(0.205 0 0);
      --sidebar-primary-foreground: oklch(0.985 0 0);
      --sidebar-accent: oklch(0.97 0 0);
      --sidebar-accent-foreground: oklch(0.205 0 0);
      --sidebar-border: oklch(0.922 0 0);
      --sidebar-ring: oklch(0.708 0 0);
    }

    :host,
    ::slotted(*) {
      box-sizing: border-box;
    }
  `

  protected render(): unknown {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-theme-provider": ThemeProvider
  }
}
