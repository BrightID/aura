import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-card")
export class CardElement extends LitElement {
  @property()
  variant: "default" | "glass" = "default"

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      background: var(
        --card-bg,
        color-mix(in oklch, var(--background) 75%, transparent)
      );
      border: 1px solid
        var(--card-border, color-mix(in oklch, var(--border) 60%, transparent));
      border-radius: var(--radius);
      padding: 1.25rem;
      transition: all 0.2s ease;
      box-shadow:
        0 1px 2px oklch(0 0 0 / 0.06),
        0 8px 30px oklch(0 0 0 / 0.08);
    }

    :host {
      --card-bg: color-mix(in oklch, var(--background) 75%, transparent);
      --card-border: color-mix(in oklch, var(--border) 60%, transparent);
    }

    :host([variant="glass"]),
    :host.glass {
      --card-bg: color-mix(in oklch, var(--background) 50%, transparent);
      backdrop-filter: blur(var(--blur)) saturate(1.4);
      -webkit-backdrop-filter: blur(var(--blur)) saturate(1.4);
    }
  `

  render() {
    return html` <slot></slot> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-card": CardElement
  }
}
