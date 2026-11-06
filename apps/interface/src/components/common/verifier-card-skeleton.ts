import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './verifier-card-skeleton.css';

@customElement('verifier-card-skeleton')
export class VerifierCardSkeleton extends LightElement {
  render() {
    return html`
      <div class="a-card" data-variant="default">
        <div class="header">
          <div class="a-skeleton" style="width: 52px; height: 52px"></div>
          <div class="copy">
            <div class="a-skeleton" style="width: 7rem; height: 1rem"></div>
            <div
              class="a-skeleton"
              style="width: 4.5rem; height: 0.75rem"
            ></div>
          </div>
        </div>
        <div class="a-skeleton" style="height: 0.5rem"></div>
      </div>
    `;
  }
}
