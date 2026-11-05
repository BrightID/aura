import { icon } from '../icon';
import { LightElement } from '../light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './shared-styles.css';
import './footer.css';

@customElement('verification-footer')
export class VerificationFooterElement extends LightElement {
  protected render() {
    return html`
      <div class="footer-row">
        ${icon('lucide:lock', 'icon')}
        <span>Secured by Aura Network</span>
        <a
          href="https://brightid.gitbook.io/aura"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </div>
    `;
  }
}
