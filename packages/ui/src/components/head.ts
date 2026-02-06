import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('a-head')
export class HeadingElement extends LitElement {
  @property({ type: String })
  level: '1' | '2' | '3' | '4' | '5' | '6' = '2'

  static styles = css`
    :host {
      display: block;
      color: var(--foreground);
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    :host([level='1']) {
      font-size: 1.875rem; /* 30px */
      line-height: 2.25rem;
    }

    :host([level='2']) {
      font-size: 1.5rem; /* 24px */
      line-height: 2rem;
    }

    :host([level='3']) {
      font-size: 1.25rem; /* 20px */
      line-height: 1.75rem;
    }

    :host([level='4']) {
      font-size: 1.125rem; /* 18px */
      line-height: 1.625rem;
    }

    :host([level='5']) {
      font-size: 1rem; /* 16px */
      line-height: 1.5rem;
    }

    :host([level='6']) {
      font-size: 0.875rem; /* 14px */
      line-height: 1.375rem;
    }
  `

  render() {
    return html`<slot></slot>`
  }
}
