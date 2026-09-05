import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'sm' | 'md' | 'lg';

@customElement('a-toggle')
export class ToggleElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare pressed: boolean;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;
  @property({ reflect: true }) declare variant: ToggleVariant;
  @property({ reflect: true }) declare size: ToggleSize;
  /** Optional identity used by `a-toggle-group` selection. */
  @property() declare value: string | undefined;

  constructor() {
    super();
    this.pressed = false;
    this.disabled = false;
    this.variant = 'default';
    this.size = 'md';
    this.value = undefined;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: var(--radius);
      font-weight: 500;
      cursor: pointer;
      color: var(--foreground);
      background: transparent;
      border: 1px solid transparent;
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
    }

    :host([variant='outline']) button {
      border-color: var(--border);
    }

    :host([size='sm']) button {
      height: 2rem;
      padding: 0 0.625rem;
      font-size: 0.8125rem;
    }
    :host([size='md']) button {
      height: 2.25rem;
      padding: 0 0.75rem;
      font-size: 0.875rem;
    }
    :host([size='lg']) button {
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 1rem;
    }

    button:hover:not(:disabled) {
      background: color-mix(in oklch, var(--accent) 50%, transparent);
      color: var(--accent-foreground);
    }

    :host([pressed]) button {
      background: var(--accent);
      color: var(--accent-foreground);
    }

    button:disabled {
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    }

    button:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  `;

  render() {
    return html`
      <button
        type="button"
        aria-pressed=${this.pressed}
        ?disabled=${this.disabled}
        @click=${this._toggle}
      >
        <slot></slot>
      </button>
    `;
  }

  private _toggle() {
    if (this.disabled) return;
    this.pressed = !this.pressed;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.pressed,
        bubbles: false,
        composed: false,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-toggle': ToggleElement;
  }
}
