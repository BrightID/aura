import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-card")
export class CardElement extends LitElement {
  @property({ reflect: true })
  variant: "default" | "glass" = "default"

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      background: var(--card-bg, var(--card));
      border: 1px solid var(--card-border, var(--border));
      border-radius: var(--radius);
      padding: var(--lg);
      transition: all 0.2s ease;
      box-shadow:
        0 1px 2px oklch(0 0 0 / 0.06),
        0 8px 30px oklch(0 0 0 / 0.08);
    }

    :host {
      --card-bg: var(--card);
      --card-border: color-mix(in oklch, var(--border) 60%, transparent);
    }

    /* Glass variant */
    :host([variant="glass"]) {
      --card-bg: color-mix(in oklch, var(--background) 50%, transparent);
      --card-border: color-mix(in oklch, var(--border) 40%, transparent);
      backdrop-filter: blur(var(--blur, 12px)) saturate(1.4);
      -webkit-backdrop-filter: blur(var(--blur, 12px)) saturate(1.4);
    }

    /* Optional: Make sure slotted content can access the design tokens */
    ::slotted(*) {
      --xs: 0.5rem;
      --sm: 0.75rem;
      --md: 1rem;
      --lg: 1.25rem;
      --xl: 1.5rem;
      --xl2: 2rem;
    }
  `

  render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-card": CardElement
  }
}
