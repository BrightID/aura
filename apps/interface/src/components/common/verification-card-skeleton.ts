import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './verification-card-skeleton.css';

@customElement('verification-card-skeleton')
export class VerificationCardSkeleton extends LightElement {
  render() {
    return html`
      <div class="a-card" data-variant="default">
        <div class="header">
          <div class="a-skeleton" style="width: 8rem; height: 1.125rem"></div>
          <div class="a-skeleton" style="width: 5rem; height: 1.25rem"></div>
        </div>
        <div class="stack">
          <div class="a-skeleton" style="width: 7rem; height: 0.875rem"></div>
          <div class="a-skeleton" style="height: 0.5rem"></div>
          <div class="a-skeleton" style="height: 2.25rem"></div>
        </div>
      </div>
    `;
  }
}
