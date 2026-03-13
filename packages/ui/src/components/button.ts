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
    :host {
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
    }

    /* pressed */
    :host(:active) {
      transform: scale(0.95);
    }

    /* disabled must be attribute-based */
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
      cursor: default;
    }

    /* keyboard focus */
    :host(:focus-visible) {
      outline: 2px solid oklch(from var(--color) 0.7 c h);
      outline-offset: 2px;
    }

    /* sizes */
    :host([size="sm"]) {
      height: 2rem;
      padding: 0 0.75rem;
      font-size: 0.8125rem;
    }

    :host([size="md"]) {
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 0.875rem;
    }

    :host([size="lg"]) {
      height: 3rem;
      padding: 0 1.5rem;
      font-size: 1rem;
    }

    /* color palette */
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

    /* variants */
    :host([variant="default"]) {
      --bg: var(--color);
      --fg: var(--color-fg);
    }

    :host([variant="default"]:hover:not([disabled])) {
      --bg: oklch(from var(--color) calc(l + 0.05) c h);
    }

    :host([variant="secondary"]) {
      --bg: color-mix(in oklch, var(--color) 15%, transparent);
      --fg: var(--color);
    }

    :host([variant="secondary"]:hover:not([disabled])) {
      --bg: color-mix(in oklch, var(--color) 25%, transparent);
    }

    :host([variant="ghost"]) {
      --bg: transparent;
      --fg: var(--color);
      border-color: transparent;
    }

    :host([variant="ghost"]:hover:not([disabled])) {
      --bg: color-mix(in oklch, var(--color) 20%, transparent);
    }
  `

  protected render(): unknown {
    return html` <slot></slot> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-button": ButtonElement
  }
}
