import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-checkbox')
export class CheckboxElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare checked: boolean;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;
  @property() declare name: string;
  @property() declare value?: string;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = 'checkbox';
    this.value = undefined;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      background: color-mix(in oklch, var(--background) 60%, transparent);
      color: var(--primary-foreground);
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
    }

    button[aria-checked='true'] {
      background: var(--primary);
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

    svg {
      width: 0.875rem;
      height: 0.875rem;
      stroke: currentColor;
      stroke-width: 3;
      fill: none;
      opacity: 0;
      transition: opacity 0.12s ease;
    }

    button[aria-checked='true'] svg {
      opacity: 1;
    }
  `;

  render() {
    return html`
      <button
        type="button"
        role="checkbox"
        aria-checked=${this.checked}
        ?disabled=${this.disabled}
        name=${this.name}
        @click=${this._toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    `;
  }

  private _toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.checked,
        bubbles: false,
        composed: false,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-checkbox': CheckboxElement;
  }
}
