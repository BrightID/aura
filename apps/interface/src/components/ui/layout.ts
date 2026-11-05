import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './footer.ts';
import './layout.css';

@customElement('app-layout')
export class AppLayout extends LightElement {
  @property({
    type: Boolean,
  })
  isEmbeded = false;

  render() {
    if (this.isEmbeded) {
      return html` <div class="embed-layout">${this.slotted}</div>`;
    }
    return html`
      <div class="layout-wrapper">
        <div class="layout">
          <main>${this.slotted}</main>
        </div>
      </div>
    `;
  }
}
