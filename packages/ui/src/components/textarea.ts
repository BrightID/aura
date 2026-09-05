import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

@customElement('a-textarea')
export class TextareaElement extends LitElement {
  @property() declare label?: string;
  @property() declare name: string;
  @property() declare placeholder: string;
  @property({ type: Number }) declare rows: number;

  @property({ reflect: true }) declare value: string;
  @property({ type: Boolean }) declare disabled: boolean;

  private readonly _textareaId = `a-textarea-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  constructor() {
    super();
    this.name = 'textarea';
    this.placeholder = '';
    this.rows = 3;
    this.value = '';
    this.disabled = false;
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
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--muted-foreground);
    }

    textarea {
      width: 100%;
      min-height: 4rem;
      padding: 0.625rem 0.875rem;
      box-sizing: border-box;
      resize: vertical;

      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.25rem;

      color: var(--foreground);
      background: color-mix(in oklch, var(--background) 82%, transparent);
      border: 1px solid var(--border);
      border-radius: var(--radius);

      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        background-color 0.18s ease;
    }

    textarea::placeholder {
      color: var(--muted-foreground);
      opacity: 0.7;
    }

    textarea:hover:not(:disabled):not(:focus) {
      border-color: color-mix(
        in oklch,
        var(--border) 85%,
        var(--foreground) 15%
      );
      background: color-mix(in oklch, var(--background) 78%, transparent);
    }

    textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 30%, transparent);
      background: color-mix(in oklch, var(--background) 75%, transparent);
      outline: none;
    }

    textarea:disabled {
      opacity: 0.52;
      cursor: not-allowed;
      background: color-mix(in oklch, var(--background) 90%, transparent);
      border-color: color-mix(in oklch, var(--border) 60%, transparent);
    }
  `;

  render() {
    return html`
      ${
        this.label
          ? html`<label for=${this._textareaId}>${this.label}</label>`
          : ''
      }

      <textarea
        id=${this._textareaId}
        rows=${this.rows}
        .value=${live(this.value)}
        @input=${this.onInputChange}
        @change=${(e: Event) => e.stopPropagation()}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        name=${this.name}
      ></textarea>
    `;
  }

  private onInputChange(e: Event) {
    e.stopPropagation();
    const target = e.target as HTMLTextAreaElement;
    this.value = target.value;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: target.value,
        bubbles: false,
        composed: false,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-textarea': TextareaElement;
  }
}
