import { css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

export type ButtonVariant = "default" | "secondary" | "ghost"

@customElement("a-button")
export class ButtonElement extends LitElement {
  @property({ reflect: true })
  variant: ButtonVariant = "default"

  @property({ reflect: true })
  size: "sm" | "md" | "lg" = "md"

  @property({ reflect: true })
  color: "primary" | "secondary" | "success" | "warning" | "destructive" =
    "primary"

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false

  static styles = css`
    /* :host only handles layout and display */
    :host {
      display: inline-flex;
      /* Optional: allow external styling via CSS variables or part */
    }

    /* The real button inside Shadow DOM - fully isolated from Tailwind */
    button {
      all: unset; /* Strong reset */
      box-sizing: border-box;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      border-radius: var(--radius);
      font-weight: 500;
      transition:
        transform 0.15s ease,
        background-color 0.15s ease;
      cursor: pointer;

      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--fg);

      outline: none;
      width: 100%;
      height: 100%;
    }

    button:disabled {
      opacity: 0.5;
      pointer-events: none;
      cursor: default;
    }

    button:focus-visible {
      outline: 2px solid oklch(from var(--color) 0.7 c h);
      outline-offset: 2px;
    }

    /* Pressed effect */
    button:active:not(:disabled) {
      transform: scale(0.95);
    }

    /* ==================== SIZES ==================== */
    :host([size="sm"]) button {
      height: 2rem;
      padding: 0 0.75rem;
      font-size: 0.8125rem;
    }

    :host([size="md"]) button {
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 0.875rem;
    }

    :host([size="lg"]) button {
      height: 3rem;
      padding: 0 1.5rem;
      font-size: 1rem;
    }

    /* ==================== COLOR PALETTE ==================== */
    :host([color="primary"]) {
      --color: var(--primary);
      --color-fg: var(--primary-foreground);
    }

    :host([color="secondary"]) {
      --color: var(--secondary);
      --color-fg: var(--secondary-foreground);
    }

    :host([color="success"]) {
      --color: var(--aura-success);
      --color-fg: white;
    }

    :host([color="warning"]) {
      --color: var(--aura-warning);
      --color-fg: white;
    }

    :host([color="destructive"]) {
      --color: oklch(0.65 0.25 25);
      --color-fg: white;
    }

    /* ==================== VARIANTS ==================== */
    :host([variant="default"]) button {
      --bg: var(--color);
      --fg: var(--color-fg);
    }

    :host([variant="default"]) button:hover:not(:disabled) {
      --bg: oklch(from var(--color) calc(l + 0.05) c h);
    }

    :host([variant="secondary"]) button {
      --bg: color-mix(in oklch, var(--color) 15%, transparent);
      --fg: var(--color);
    }

    :host([variant="secondary"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 25%, transparent);
    }

    :host([variant="ghost"]) button {
      --bg: transparent;
      --fg: var(--color);
      border-color: transparent;
    }

    :host([variant="ghost"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 20%, transparent);
    }
  `

  protected render() {
    return html`
      <button ?disabled=${this.disabled} part="button">
        <slot></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-button": ButtonElement
  }
}
