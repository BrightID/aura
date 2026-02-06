import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('a-input')
export class InputElement extends LitElement {
  @property()
  type: string = 'text'

  @property()
  label?: string

  @property()
  name: string = 'input-text'

  @property()
  placeholder = ''

  @property({ type: Boolean })
  disabled = false

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    input {
      width: 100%;
      height: 2.5rem;
      padding: 0 0.75rem;
      box-sizing: border-box;
      border-radius: var(--radius);
      font-size: 0.875rem;

      color: var(--foreground);
      background: color-mix(in oklch, var(--background) 80%, transparent);

      border: 1px solid color-mix(in oklch, var(--border) 70%, transparent);

      backdrop-filter: blur(12px) saturate(1.2);
      -webkit-backdrop-filter: blur(12px) saturate(1.2);

      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        background-color 0.15s ease;

      outline: none;
    }

    input::placeholder {
      color: var(--muted-foreground);
    }
    //
    // input:hover:not(:disabled) {
    //   border-color: color-mix(in oklch, var(--border) 90%, transparent);
    // }

    input:focus-visible {
      border-color: var(--ring);
      box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 35%, transparent);
    }

    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    label {
      font-size: var(--sm);
      font-weight: 500;
    }
  `

  render() {
    return html`
      ${this.label ? html` <label> ${this.label} </label> ` : ''}
      <input
        .type=${this.type}
        .placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        .name=${this.name}
      />
    `
  }
}
