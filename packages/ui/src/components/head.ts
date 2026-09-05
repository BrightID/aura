import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-head')
export class HeadingElement extends LitElement {
  @property({ type: String, reflect: true })
  declare level: '1' | '2' | '3' | '4' | '5' | '6';

  constructor() {
    super();
    this.level = '2';
  }

  static styles = css`
    /* No default margins — pages lay headings out with flex/gap; opt into
       spacing with utility classes instead of fighting baked-in margins. */
    :host {
      display: block;
      color: var(--foreground);
      font-weight: 600;
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
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-head': HeadingElement;
  }
}
