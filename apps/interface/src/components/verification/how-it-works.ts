import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

const steps = [
  {
    title: 'Connect Your Identity',
    description: 'Link your BrightID or create a universal identifier that you control.',
    icon: html`<iconify-icon icon="lucide:user" width="1.25em" height="1.25em"></iconify-icon>`
  },
  {
    title: 'Get Evaluated',
    description: 'People who know you evaluate your uniqueness. No personal info is shared.',
    icon: html`<iconify-icon icon="lucide:users" width="1.25em" height="1.25em"></iconify-icon>`
  },
  {
    title: 'Earn Levels',
    description: 'Your verification level increases as you receive positive evaluations.',
    icon: html`<iconify-icon icon="lucide:badge-check" width="1.25em" height="1.25em"></iconify-icon>`
  },
  {
    title: 'Unlock Access',
    description: 'Apps verify your level to grant access—without seeing your identity.',
    icon: html`<iconify-icon icon="lucide:lock-open" width="1.25em" height="1.25em"></iconify-icon>`
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
    .back-btn iconify-icon {
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
    .privacy-icon iconify-icon {
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
    .logo {
      width: 3rem;
      height: 3rem;
    }
  `

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
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
            `
          )}
        </div>

        <div class="privacy-note">
          <div class="privacy-icon">
            <iconify-icon icon="lucide:lock"></iconify-icon>
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
