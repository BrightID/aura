import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-switch")
export class SwitchElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare checked: boolean
  @property({ type: Boolean, reflect: true }) declare disabled: boolean
  @property() declare name: string
  @property() declare label: string | undefined

  constructor() {
    super()
    this.checked = false
    this.disabled = false
    this.name = "switch"
    this.label = undefined
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
    }

    label {
      font-size: 0.875rem;
      color: var(--foreground);
      cursor: pointer;
      user-select: none;
    }

    button {
      all: unset;
      box-sizing: border-box;
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      width: 2.75rem;
      height: 1.5rem;
      border-radius: 999px;
      cursor: pointer;
      border: 1px solid color-mix(in oklch, var(--border) 70%, transparent);
      background: var(--input, color-mix(in oklch, var(--muted-foreground) 25%, transparent));
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
    }

    button[aria-checked="true"] {
      background: var(--primary);
      border-color: transparent;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    button:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .thumb {
      position: absolute;
      top: 1px;
      left: 1px;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background: white;
      box-shadow: 0 1px 2px oklch(0 0 0 / 0.2);
      transition: transform 0.15s ease;
    }

    button[aria-checked="true"] .thumb {
      transform: translateX(1.25rem);
    }
  `

  render() {
    return html`
      <button
        type="button"
        role="switch"
        aria-checked=${this.checked}
        ?disabled=${this.disabled}
        name=${this.name}
        @click=${this._toggle}
      >
        <span class="thumb"></span>
      </button>
      ${this.label ? html`<label @click=${this._toggle}>${this.label}</label>` : ""}
    `
  }

  private _toggle() {
    if (this.disabled) return
    this.checked = !this.checked

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.checked,
        bubbles: false,
        composed: false,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-switch": SwitchElement
  }
}
