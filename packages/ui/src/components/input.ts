import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property, state } from "lit/decorators.js"

@customElement("a-input")
export class InputElement extends LitElement {
  @property() type: "text" | "email" | "password" | "number" = "text"
  @property() label?: string
  @property() name: string = "input-text"
  @property() placeholder = ""

  @property({ reflect: true }) value = ""
  @property({ type: Boolean }) disabled = false

  @state() private _hasPrefix = false
  @state() private _hasSuffix = false

  private readonly _inputId = `a-input-${Math.random().toString(36).slice(2, 9)}`

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      position: relative;
      margin-bottom: 0.5rem;
    }

    label {
      display: block;
      text-align: left;
      margin-bottom: 0.5rem;
      font-size: var(--sm);
      font-weight: 500;
      color: var(--muted-foreground);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    /* Icon Slots */
    ::slotted([slot="prefix"]),
    ::slotted([slot="suffix"]) {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
      font-size: 1.1rem;
      z-index: 1;
      width: 1.1em;
      height: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ::slotted([slot="prefix"]) {
      left: 0.875rem;
    }

    ::slotted([slot="suffix"]) {
      right: 0.875rem;
    }

    input {
      width: 100%;
      height: 2.5rem;
      padding: 0 0.875rem;
      box-sizing: border-box;

      font-size: 0.875rem;
      line-height: 1.25rem;

      color: var(--foreground);
      background: color-mix(in oklch, var(--background) 82%, transparent);
      border: 1px solid var(--border);
      border-radius: var(--radius);

      backdrop-filter: blur(12px) saturate(1.25);
      -webkit-backdrop-filter: blur(12px) saturate(1.25);

      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        background-color 0.18s ease;
    }

    /* Adjust padding when prefix/suffix exists */
    input.has-prefix {
      padding-left: 2.75rem;
    }
    input.has-suffix {
      padding-right: 2.75rem;
    }
    input.has-prefix.has-suffix {
      padding-left: 2.75rem;
      padding-right: 2.75rem;
    }

    input::placeholder {
      color: var(--muted-foreground);
      opacity: 0.7;
    }

    input:hover:not(:disabled):not(:focus) {
      border-color: color-mix(
        in oklch,
        var(--border) 85%,
        var(--foreground) 15%
      );
      background: color-mix(in oklch, var(--background) 78%, transparent);
    }

    input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 30%, transparent);
      background: color-mix(in oklch, var(--background) 75%, transparent);
      outline: none;
      transform: translateY(-0.5px);
    }

    input:disabled {
      opacity: 0.52;
      cursor: not-allowed;
      background: color-mix(in oklch, var(--background) 90%, transparent);
      border-color: color-mix(in oklch, var(--border) 60%, transparent);
    }
  `

  render() {
    return html`
      ${this.label
        ? html`<label for=${this._inputId}>${this.label}</label>`
        : ""}

      <div class="input-wrapper">
        <!-- Prefix Icon Slot -->
        <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>

        <input
          id=${this._inputId}
          class=${[
            this._hasPrefix ? "has-prefix" : "",
            this._hasSuffix ? "has-suffix" : "",
          ]
            .join(" ")
            .trim()}
          .value=${this.value}
          @input=${this.onInputChange}
          .type=${this.type}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          name=${this.name}
        />

        <!-- Suffix Icon Slot -->
        <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
      </div>
    `
  }

  private _onPrefixSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement
    this._hasPrefix = slot.assignedElements().length > 0
  }

  private _onSuffixSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement
    this._hasSuffix = slot.assignedElements().length > 0
  }

  private onInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    this.value = target.value

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: target.value,
        bubbles: true,
        composed: true,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-input": InputElement
  }
}
