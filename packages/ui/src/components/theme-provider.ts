import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-theme-provider")
export class ThemeProvider extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      box-sizing: border-box;

      --tab-bg: linear-gradient(
        135deg,
        color-mix(in oklch, var(--card) 20%, transparent) 0%,
        color-mix(in oklch, var(--card) 8%, transparent) 100%
      );
      --toast: linear-gradient(
        135deg,
        color-mix(in oklch, var(--card) 20%, transparent) 0%,
        color-mix(in oklch, var(--card) 8%, transparent) 100%
      );

      --xs: 0.5rem;
      --sm: 0.75rem;
      --md: 1rem;
      --lg: 1.25rem;
      --xl: 1.5rem;
      --xl2: 2rem;

      /* surface hierarchy — deepest → most elevated */
      --background: oklch(0.145 0.014 238);
      --card: oklch(0.19 0.018 238);
      --popover: oklch(0.175 0.018 238);
      --muted: oklch(0.235 0.018 244);
      --input: oklch(0.225 0.018 244);
      --border: oklch(0.305 0.018 244);
      --overlay: oklch(0.09 0.012 242 / 0.72);

      /* foreground / text */
      --foreground: oklch(0.965 0.008 245);
      --card-foreground: oklch(0.965 0.008 245);
      --popover-foreground: oklch(0.965 0.008 245);
      --secondary-foreground: oklch(0.91 0.01 245);
      --muted-foreground: oklch(0.69 0.012 245);

      /* brand */
      --primary: oklch(0.69 0.14 182);
      --primary-foreground: oklch(0.115 0.018 226);

      /* secondary surface */
      --secondary: oklch(0.255 0.022 246);

      /* accent */
      --accent: oklch(0.665 0.12 226);
      --accent-foreground: oklch(0.11 0.018 226);

      /* semantic */
      --destructive: oklch(0.62 0.2 25);
      --destructive-foreground: oklch(0.98 0 0);
      --ring: oklch(0.69 0.14 182);
      --orange: oklch(0.74 0.15 62);
      --radius: 0.625rem;

      /* aura semantic colors */
      --aura-success: oklch(0.70 0.15 154);
      --aura-warning: oklch(0.78 0.15 76);
      --aura-info: oklch(0.665 0.12 226);
      --aura-error: oklch(0.62 0.20 25);

      /* aura level indicators (low → high trust) */
      --aura-level-1: oklch(0.74 0.13 82);
      --aura-level-2: oklch(0.665 0.12 226);
      --aura-level-3: oklch(0.70 0.15 154);

      /* chart palette — visually distinct */
      --chart-1: oklch(0.69 0.14 182);
      --chart-2: oklch(0.665 0.12 226);
      --chart-3: oklch(0.75 0.15 76);
      --chart-4: oklch(0.66 0.16 305);
      --chart-5: oklch(0.66 0.18 30);

      /* sidebar — dark, slightly deeper than background */
      --sidebar: oklch(0.12 0.014 242);
      --sidebar-foreground: oklch(0.94 0.008 245);
      --sidebar-primary: oklch(0.69 0.14 182);
      --sidebar-primary-foreground: oklch(0.11 0.018 226);
      --sidebar-accent: oklch(0.205 0.018 244);
      --sidebar-accent-foreground: oklch(0.92 0.01 245);
      --sidebar-border: oklch(0.265 0.016 244);
      --sidebar-ring: oklch(0.69 0.14 182);
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
