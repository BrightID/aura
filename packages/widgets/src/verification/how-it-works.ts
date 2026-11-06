import { icon } from '../icon';
import { LightElement } from '../light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './shared-styles.css';
import './how-it-works.css';

const steps = [
  {
    title: 'Connect Your Identity',
    description:
      'Link your BrightID or create a universal identifier that you control.',
    icon: html`${icon('lucide:user', '', 'width: 1.25em; height: 1.25em')}`,
  },
  {
    title: 'Get Evaluated',
    description:
      'People who know you evaluate your uniqueness. No personal info is shared.',
    icon: html`${icon('lucide:users', '', 'width: 1.25em; height: 1.25em')}`,
  },
  {
    title: 'Earn Levels',
    description:
      'Your verification level increases as you receive positive evaluations.',
    icon: html`${icon('lucide:badge-check', '', 'width: 1.25em; height: 1.25em')}`,
  },
  {
    title: 'Unlock Access',
    description:
      'Apps verify your level to grant access—without seeing your identity.',
    icon: html`${icon('lucide:lock-open', '', 'width: 1.25em; height: 1.25em')}`,
  },
];

@customElement('verification-how-it-works')
export class VerificationHowItWorksElement extends LightElement {
  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button
            class="back-btn"
            aria-label="Go back"
            @click=${() => this._emit('back')}
          >
            ${icon('lucide:chevron-left')}
          </button>
          <div class="header-title">
            <img src="/aura2.png" class="logo" alt="Aura" />
            <h2 class="title">How Aura Works</h2>
          </div>
        </div>

        <div class="steps">
          ${steps.map(
            (step) => html`
              <div class="step-item">
                <div class="step-icon">${step.icon}</div>
                <div class="step-content">
                  <h3 class="step-title">${step.title}</h3>
                  <p class="step-desc">${step.description}</p>
                </div>
              </div>
            `,
          )}
        </div>

        <div class="privacy-note">
          <div class="privacy-icon">${icon('lucide:lock')}</div>
          <div>
            <p class="privacy-heading">Privacy First</p>
            <p class="privacy-desc">
              Aura generates privacy-preserving proofs. Apps only see your
              verification level, never your identity.
            </p>
          </div>
        </div>

        <button
          class="a-button"
          type="button"
          @click=${() => this._emit('back')}
        >
          Got it
        </button>
      </div>
    `;
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
