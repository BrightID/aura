import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-input")
export class InputElement extends LitElement {
  @property() type: "text" | "email" | "password" | "number" = "text"
  @property() label?: string
  @property() name: string = "input-text"
  @property() placeholder = ""
  @property({ reflect: true }) value = ""
  @property({ type: Boolean }) disabled = false

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      position: relative;
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: var(--sm);
      font-weight: 500;
      color: var(--muted-foreground);
    }

    .input-wrapper {
      position: relative;
    }

    ::slotted([slot="icon"]) {
      position: absolute;
      top: 50%;
      left: 0.875rem;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
      font-size: 1.1rem;
      z-index: 1;
      width: 1.1em;
      height: 1.1em;
      display: block;
    }

    input {
      width: 100%;
      height: 2.5rem;
      padding: 0 0.875rem;
      padding-left: 2.75rem; /* ← space for icon */
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

    /* When no icon is present → less left padding */
    :host(:not(:has([slot="icon"]))) input {
      padding-left: 0.875rem;
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
    }

    input:focus-visible {
      border-color: var(--ring);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent);
    }

    input:disabled {
      opacity: 0.52;
      cursor: not-allowed;
      background: color-mix(in oklch, var(--background) 90%, transparent);
      border-color: color-mix(in oklch, var(--border) 60%, transparent);
    }

    /* Optional — slightly raised effect on focus for some depth */
    input:focus {
      transform: translateY(-0.5px);
    }
  `

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}

      <div class="input-wrapper">
        <slot name="icon" class="icon"></slot>

        <input
          .value=${this.value}
          @input=${this.onInputChange}
          .type=${this.type}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          name=${this.name}
        />
      </div>
    `
  }

  private onInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    this.value = target.value // optional: two-way binding support

    this.dispatchEvent(
      new CustomEvent("change", {
        // more standard name than "onChange"
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
