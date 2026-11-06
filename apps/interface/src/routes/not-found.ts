import { LightElement } from '@aura/widgets/light-element';
import { pushRouter } from '@/router';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './not-found.css';

@customElement('not-found')
export class NotFoundElement extends LightElement {
  protected render() {
    return html`
      <div class="a-card" data-variant="default">
        <h2 class="a-head">Page not found</h2>
        <p class="a-text" data-variant="muted">That page is not in Aura.</p>
        <button
          class="a-button"
          type="button"
          @click=${() => pushRouter('/home')}
        >
          Back home
        </button>
      </div>
    `;
  }
}
