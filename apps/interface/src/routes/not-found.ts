import { pushRouter } from '@/router';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('not-found')
export class NotFoundElement extends LitElement {
  static styles = css`
    a-card {
      display: block;
    }
    a-text {
      margin: 8px 0 16px;
    }
  `;

  protected render() {
    return html`
      <a-card variant="default">
        <a-head level="2">Page not found</a-head>
        <a-text variant="muted">That page is not in Aura.</a-text>
        <a-button @click=${() => pushRouter('/home')}>Back home</a-button>
      </a-card>
    `;
  }
}
