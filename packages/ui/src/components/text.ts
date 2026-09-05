import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-text')
export class TextElement extends LitElement {
  @property({ type: String, reflect: true })
  declare variant: 'title' | 'lead' | 'body' | 'small' | 'muted';

  @property({ type: String, reflect: true })
  declare size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  constructor() {
    super();
    this.variant = 'body';
  }

  static styles = css`
    :host {
      display: block;
      color: var(--foreground);
    }

    :host([variant='title']) {
      font-size: 2.25rem;
      line-height: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    :host([variant='lead']) {
      font-size: 1.25rem;
      line-height: 1.75rem;
      color: var(--muted-foreground);
    }

    :host([variant='body']) {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    :host([variant='small']) {
      font-size: 0.875rem;
      line-height: 1.375rem;
    }

    :host([variant='muted']) {
      font-size: 0.875rem;
      line-height: 1.375rem;
      color: var(--muted-foreground);
    }

    :host([size='xs']) {
      font-size: 0.75rem;
      line-height: 1rem;
    }

    :host([size='sm']) {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    :host([size='md']) {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    :host([size='lg']) {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    :host([size='xl']) {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    :host([size='2xl']) {
      font-size: 1.5rem;
      line-height: 2rem;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-text': TextElement;
  }
}
