import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

const steps = [
  {
    title: 'Connect Your Identity',
    description: 'Link your BrightID or create a universal identifier that you control.',
    icon: html`<svg
      width="1.25em"
      height="1.25em"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>`
  },
  {
    title: 'Get Evaluated',
    description: 'People who know you evaluate your uniqueness. No personal info is shared.',
    icon: html`<svg
      width="1.25em"
      height="1.25em"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>`
  },
  {
    title: 'Earn Levels',
    description: 'Your verification level increases as you receive positive evaluations.',
    icon: html`<svg
      width="1.25em"
      height="1.25em"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>`
  },
  {
    title: 'Unlock Access',
    description: 'Apps verify your level to grant access—without seeing your identity.',
    icon: html`<svg
      width="1.25em"
      height="1.25em"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
      />
    </svg>`
  }
]

@customElement('verification-how-it-works')
export class VerificationHowItWorksElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: 1.25em;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75em;
    }
    .back-btn {
      padding: 0.375em;
      margin-left: -0.375em;
      border-radius: 0.5em;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .back-btn:hover {
      background: var(--secondary);
    }
    .back-btn svg {
      width: 1.25em;
      height: 1.25em;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .aura-logo {
      width: 1.25em;
      height: 1.25em;
    }
    .title {
      margin: 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
    }

    /* Steps */
    .steps {
      display: flex;
      flex-direction: column;
      gap: 0.75em;
    }
    .step-item {
      display: flex;
      gap: 0.75em;
      padding: 0.75em;
      background: var(--secondary);
      border-radius: 0.5em;
    }
    .step-icon {
      flex-shrink: 0;
      width: 2.25em;
      height: 2.25em;
      border-radius: 0.5em;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-content {
      flex: 1;
      min-width: 0;
    }
    .step-title {
      margin: 0 0 0.25em;
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
    }
    .step-desc {
      margin: 0;
      font-size: 0.75em;
      color: var(--muted-foreground);
      line-height: 1.5;
    }

    /* Privacy note */
    .privacy-note {
      padding: 0.75em;
      background: rgba(var(--aura-info-rgb, 96, 165, 250), 0.05);
      border: 1px solid rgba(var(--aura-info-rgb, 96, 165, 250), 0.2);
      border-radius: 0.5em;
      display: flex;
      gap: 0.5em;
    }
    .privacy-icon {
      flex-shrink: 0;
      margin-top: 0.125em;
    }
    .privacy-icon svg {
      width: 1em;
      height: 1em;
      color: var(--aura-info);
    }
    .privacy-heading {
      margin: 0 0 0.25em;
      font-size: 0.75em;
      font-weight: 500;
      color: var(--aura-info);
    }
    .privacy-desc {
      margin: 0;
      font-size: 0.75em;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
  `

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div class="header-title">
            <svg class="aura-logo" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="#a0dba0" stroke-width="2" opacity="0.4" />
              <circle cx="16" cy="16" r="10" stroke="#c8e6c8" stroke-width="2" opacity="0.6" />
              <circle cx="16" cy="16" r="6" fill="#ffd700" />
              <circle cx="16" cy="16" r="3" fill="#ff8c00" />
            </svg>
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
            `
          )}
        </div>

        <div class="privacy-note">
          <div class="privacy-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <p class="privacy-heading">Privacy First</p>
            <p class="privacy-desc">
              Aura generates privacy-preserving proofs. Apps only see your verification level, never
              your identity.
            </p>
          </div>
        </div>

        <a-button @click=${() => this._emit('back')}>Got it</a-button>
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
