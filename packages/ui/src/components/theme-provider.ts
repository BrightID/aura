import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-theme-provider")
export class ThemeProvider extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      box-sizing: border-box;

      /* spacing scale */
      --xs: 0.5rem;
      --sm: 0.75rem;
      --md: 1rem;
      --lg: 1.25rem;
      --xl: 1.5rem;
      --xl2: 2rem;

      /* surface hierarchy — deepest → most elevated */
      --background: oklch(0.11 0.012 265);
      --card: oklch(0.16 0.015 265);
      --popover: oklch(0.14 0.013 265);
      --muted: oklch(0.20 0.015 265);
      --input: oklch(0.20 0.015 265);
      --border: oklch(0.27 0.018 265);
      --overlay: oklch(0.08 0.01 265 / 0.7);

      /* foreground / text */
      --foreground: oklch(0.96 0.005 265);
      --card-foreground: oklch(0.96 0.005 265);
      --popover-foreground: oklch(0.96 0.005 265);
      --secondary-foreground: oklch(0.88 0.005 265);
      --muted-foreground: oklch(0.58 0.01 265);

      /* brand — aura green */
      --primary: oklch(0.74 0.20 152);
      --primary-foreground: oklch(0.10 0.01 265);

      /* secondary surface */
      --secondary: oklch(0.22 0.018 265);

      /* accent — electric cyan */
      --accent: oklch(0.68 0.18 195);
      --accent-foreground: oklch(0.10 0.01 265);

      /* semantic */
      --destructive: oklch(0.57 0.22 20);
      --destructive-foreground: oklch(0.98 0 0);
      --ring: oklch(0.74 0.20 152);
      --radius: 0.75rem;

      /* aura semantic colors */
      --aura-success: oklch(0.74 0.20 152);
      --aura-warning: oklch(0.80 0.17 75);
      --aura-info: oklch(0.68 0.18 220);
      --aura-error: oklch(0.57 0.22 20);

      /* aura level indicators (low → high trust) */
      --aura-level-1: oklch(0.68 0.14 90);
      --aura-level-2: oklch(0.68 0.18 195);
      --aura-level-3: oklch(0.74 0.20 152);

      /* chart palette — visually distinct */
      --chart-1: oklch(0.74 0.20 152);
      --chart-2: oklch(0.68 0.18 195);
      --chart-3: oklch(0.65 0.17 280);
      --chart-4: oklch(0.78 0.16 75);
      --chart-5: oklch(0.60 0.21 20);

      /* sidebar — dark, slightly deeper than background */
      --sidebar: oklch(0.09 0.01 265);
      --sidebar-foreground: oklch(0.94 0.005 265);
      --sidebar-primary: oklch(0.74 0.20 152);
      --sidebar-primary-foreground: oklch(0.10 0.01 265);
      --sidebar-accent: oklch(0.18 0.015 265);
      --sidebar-accent-foreground: oklch(0.88 0.005 265);
      --sidebar-border: oklch(0.22 0.015 265);
      --sidebar-ring: oklch(0.74 0.20 152);
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
