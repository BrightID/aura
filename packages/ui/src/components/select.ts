import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"
import { live } from "lit/directives/live.js"

export interface SelectOption {
  label: string
  value: string
}

@customElement("a-select")
export class SelectElement extends LitElement {
  @property() declare label: string | undefined
  @property() declare name: string
  @property({ reflect: true }) declare value: string
  @property({ type: Boolean }) declare disabled: boolean
  @property({ type: Array }) declare options: SelectOption[]
  @property() declare placeholder: string

  constructor() {
    super()
    this.label = undefined
    this.name = "select"
    this.value = ""
    this.disabled = false
    this.options = []
    this.placeholder = ""
  }

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

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    select {
      width: 100%;
      height: 2.5rem;
      padding: 0 2.25rem 0 0.875rem;
      box-sizing: border-box;

      font-size: 0.875rem;
      line-height: 1.25rem;

      color: var(--foreground);
      background: color-mix(in oklch, var(--background) 82%, transparent);
      border: 1px solid var(--border);
      border-radius: var(--radius);

      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;

      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        background-color 0.18s ease;
    }

    select:hover:not(:disabled):not(:focus) {
      border-color: color-mix(in oklch, var(--border) 85%, var(--foreground) 15%);
      background: color-mix(in oklch, var(--background) 78%, transparent);
    }

    select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 30%, transparent);
      background: color-mix(in oklch, var(--background) 75%, transparent);
      outline: none;
    }

    select:disabled {
      opacity: 0.52;
      cursor: not-allowed;
      background: color-mix(in oklch, var(--background) 90%, transparent);
      border-color: color-mix(in oklch, var(--border) 60%, transparent);
    }

    .chevron {
      position: absolute;
      right: 0.75rem;
      display: flex;
      color: var(--muted-foreground);
      pointer-events: none;
    }
  `

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}
      <div class="select-wrapper">
        <select
          .value=${live(this.value)}
          @change=${this._onChange}
          ?disabled=${this.disabled}
          name=${this.name}
        >
          ${this.placeholder ? html`<option value="">${this.placeholder}</option>` : ""}
          ${this.options.map(
            (o) => html`<option value=${o.value} ?selected=${o.value === this.value}>${o.label}</option>`,
          )}
        </select>
        <span class="chevron">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
    `
  }

  private _onChange(e: Event) {
    e.stopPropagation()
    const target = e.target as HTMLSelectElement
    this.value = target.value

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: target.value,
        bubbles: false,
        composed: false,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-select": SelectElement
  }
}
