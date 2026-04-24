import { css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

export type ButtonVariant = "default" | "secondary" | "ghost" | "outline"
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"
export type ButtonColors =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"

@customElement("a-button")
export class ButtonElement extends LitElement {
  @property({ reflect: true })
  variant: ButtonVariant = "default"

  @property({ reflect: true })
  size: ButtonSize = "md"

  @property({ reflect: true })
  color: ButtonColors = "primary"

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false

  @property({})
  class: string | undefined

  static styles = css`
    :host {
      display: inline-flex;
    }

    button {
      all: unset;
      box-sizing: border-box;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      border-radius: var(--radius);
      font-weight: 500;
      transition:
        transform 0.15s ease,
        background-color 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
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

    :host([size="icon-sm"]) button {
      width: 2rem;
      height: 2rem;
      padding: 0;
    }
    :host([size="icon-sm"]) {
      --icon-size: 1rem;
      --icon-gap: 0;
    }

    /* icon: 2.5rem square (matches md height) */
    :host([size="icon"]) button {
      /* width: 2.5rem;
      height: 2.5rem; */
      padding: 0.5rem;
    }
    :host([size="icon"]) {
      --icon-size: 1.125rem;
      --icon-gap: 0;
    }

    /* icon-lg: 3rem square (matches lg height) */
    :host([size="icon-lg"]) button {
      width: 3rem;
      height: 3rem;
      padding: 0;
    }
    :host([size="icon-lg"]) {
      --icon-size: 1.25rem;
      --icon-gap: 0;
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

    /* Default (filled) */
    :host([variant="default"]) button {
      --bg: var(--color);
      --fg: var(--color-fg);
      --border: transparent;
    }

    :host([variant="default"]) button:hover:not(:disabled) {
      --bg: oklch(from var(--color) calc(l + 0.05) c h);
    }

    /* Secondary */
    :host([variant="secondary"]) button {
      --bg: color-mix(in oklch, var(--color) 15%, transparent);
      --fg: var(--color);
      --border: transparent;
    }

    :host([variant="secondary"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 25%, transparent);
    }

    /* Ghost */
    :host([variant="ghost"]) button {
      --bg: transparent;
      --fg: var(--color);
      --border: transparent;
    }

    :host([variant="ghost"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 20%, transparent);
    }

    /* NEW: Outline variant */
    :host([variant="outline"]) button {
      --bg: transparent;
      --fg: var(--color);
      --border: var(--color);
    }

    :host([variant="outline"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 10%, transparent);
    }

    /* Optional: stronger hover for outline */
    /* :host([variant="outline"]) button:hover:not(:disabled) {
      --bg: color-mix(in oklch, var(--color) 15%, transparent);
      --border: oklch(from var(--color) calc(l - 0.05) c h);
    } */
  `

  protected render() {
    return html`
      <button .class=${this.class} ?disabled=${this.disabled} part="button">
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
