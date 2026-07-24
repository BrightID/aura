import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-radio-group")
export class RadioGroupElement extends LitElement {
  @property({ reflect: true }) declare value: string
  @property() declare name: string
  @property({ type: Boolean, reflect: true }) declare disabled: boolean

  constructor() {
    super()
    this.value = ""
    this.name = "radio-group"
    this.disabled = false
    this.addEventListener("radio-select", this._onRadioSelect as EventListener)
  }

  static styles: CSSResultGroup = css`
    :host {
      display: grid;
      gap: 0.75rem;
    }
  `

  render() {
    return html`<slot @slotchange=${this._sync}></slot>`
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("value") || changed.has("disabled")) this._sync()
  }

  private _sync = () => {
    for (const radio of this._radios()) {
      radio.checked = radio.value === this.value
      radio.groupDisabled = this.disabled
    }
  }

  private _radios(): RadioElement[] {
    return Array.from(this.querySelectorAll("a-radio")) as RadioElement[]
  }

  private _onRadioSelect = (e: CustomEvent<string>) => {
    e.stopPropagation()
    if (this.disabled) return
    this.value = e.detail
    this._sync()
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.value,
        bubbles: false,
        composed: false,
      }),
    )
  }
}

@customElement("a-radio")
export class RadioElement extends LitElement {
  @property() declare value: string
  @property({ type: Boolean, reflect: true }) declare checked: boolean
  @property({ type: Boolean, reflect: true }) declare disabled: boolean

  /** Set by the parent group; disables the radio when the group is disabled. */
  @property({ type: Boolean, attribute: false }) declare groupDisabled: boolean

  constructor() {
    super()
    this.value = ""
    this.checked = false
    this.disabled = false
    this.groupDisabled = false
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: color-mix(in oklch, var(--background) 60%, transparent);
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    button[aria-checked="true"] {
      border-color: var(--primary);
    }

    button:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--primary);
      transform: scale(0);
      transition: transform 0.12s ease;
    }

    button[aria-checked="true"] .dot {
      transform: scale(1);
    }

    label {
      font-size: 0.875rem;
      color: var(--foreground);
      cursor: pointer;
      user-select: none;
    }
  `

  render() {
    const disabled = this.disabled || this.groupDisabled
    return html`
      <button
        type="button"
        role="radio"
        aria-checked=${this.checked}
        ?disabled=${disabled}
        @click=${this._select}
      >
        <span class="dot"></span>
      </button>
      <label @click=${this._select}><slot></slot></label>
    `
  }

  private _select() {
    if (this.disabled || this.groupDisabled) return
    this.dispatchEvent(
      new CustomEvent("radio-select", {
        detail: this.value,
        bubbles: true,
        composed: true,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-radio-group": RadioGroupElement
    "a-radio": RadioElement
  }
}
