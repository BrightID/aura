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
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
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
      /* --card-bg: oklch(1 0 0 / 0.2); */
      --card-border: var(--border);
      backdrop-filter: blur(1px);
      -webkit-backdrop-filter: blur(1px);
      box-shadow: none;
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
