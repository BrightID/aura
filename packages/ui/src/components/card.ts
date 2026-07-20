import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-card")
export class CardElement extends LitElement {
  /** Glass is the design default; use `variant="default"` for a solid card. */
  @property({ reflect: true })
  declare variant: "default" | "glass"

  /** Clickable card: pointer cursor, hover lift, press feedback. */
  @property({ type: Boolean, reflect: true })
  declare interactive: boolean

  constructor() {
    super()
    this.variant = "glass"
    this.interactive = false
  }

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
      --blur: 2px;
      background: linear-gradient(
        135deg,
        color-mix(in oklch, var(--card) 20%, transparent) 0%,
        color-mix(in oklch, var(--card) 8%, transparent) 100%
      );
      border: none;
      backdrop-filter: blur(var(--blur)) saturate(180%);
      -webkit-backdrop-filter: blur(var(--blur)) saturate(180%);
      box-shadow:
        0 1px 2px oklch(0 0 0 / 0.04),
        0 12px 40px oklch(0 0 0 / 0.12);
    }

    :host([variant="glass"]):hover {
      box-shadow:
        0 2px 4px oklch(0 0 0 / 0.06),
        0 16px 50px oklch(0 0 0 / 0.18);
    }

    /* Interactive cards behave like buttons */
    :host([interactive]) {
      cursor: pointer;
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }

    :host([interactive][variant="default"]:hover) {
      background: color-mix(in oklch, var(--foreground) 6%, var(--card));
    }

    :host([interactive][variant="glass"]:hover) {
      background: linear-gradient(
        135deg,
        color-mix(in oklch, var(--card) 30%, transparent) 0%,
        color-mix(in oklch, var(--card) 14%, transparent) 100%
      );
    }

    :host([interactive]:active) {
      transform: scale(0.99);
    }

    :host([interactive]:focus-visible) {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
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
