import { icon } from '../icon';
import { LightElement } from '../light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './level-badge';
import './shared-styles.css';
import './success-step.css';

@customElement('verification-success')
export class VerificationSuccessElement extends LightElement {
  @property() appName = '';
  @property({ type: Number }) level = 1;
  @property({ type: Boolean }) loading = false;

  protected render() {
    return html`
      <div class="stack">
        <div class="success-ring">
          <div class="ring-pulse"></div>
          <div class="ring-inner">${icon('lucide:check')}</div>
        </div>

        <div class="message-group">
          <h2 class="title">Verification Successful</h2>
          <p class="subtitle">You're verified to use ${this.appName}</p>
        </div>

        <div class="level-card">
          <span class="level-label">Your Level</span>
          <verification-level-badge
            .level=${this.level}
            size="lg"
          ></verification-level-badge>
        </div>

        <button
          class="a-button"
          type="button"
          data-size="lg"
          ?disabled=${this.loading}
          @click=${() => this._emit('continue')}
        >
          ${this.loading ? 'Generating signature…' : html`Continue to ${this.appName}`}
        </button>

        <p class="footnote">
          This verification can be used across multiple apps
        </p>
      </div>
    `;
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
