import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './level-badge'

@customElement('verification-success')
export class VerificationSuccessElement extends LitElement {
  @property() appName = ''
  @property({ type: Number }) level = 1

  static styles: CSSResultGroup = css`
    :host { display: block; font-size: inherit; }

    .stack {
      display: flex; flex-direction: column;
      align-items: center; gap: 1.25em;
      padding: 0.5em 0; text-align: center;
    }

    /* Animated ring */
    .success-ring { position: relative; width: 5em; height: 5em; }
    .ring-pulse {
      position: absolute; inset: 0; border-radius: 9999px;
      background: rgba(74, 222, 128, 0.2);
      animation: pulse 1.5s ease-out infinite;
    }
    @keyframes pulse {
      0%   { transform: scale(0.9); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .ring-inner {
      position: relative; width: 100%; height: 100%;
      border-radius: 9999px; background: rgba(74, 222, 128, 0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .ring-inner iconify-icon { width: 2.5em; height: 2.5em; color: var(--aura-success); }

    /* Message */
    .message-group { display: flex; flex-direction: column; gap: 0.5em; }
    .title    { margin: 0; font-size: 1.25em; font-weight: 600; color: var(--foreground); }
    .subtitle { margin: 0; font-size: 0.9375em; color: var(--muted-foreground); }

    /* Level card */
    .level-card {
      display: inline-flex; flex-direction: column;
      align-items: center; gap: 0.5em;
      padding: 1em 1.5em;
      background: var(--secondary);
      border-radius: var(--radius, 0.75rem);
    }
    .level-label {
      font-size: 0.6875em; text-transform: uppercase;
      letter-spacing: 0.075em; color: var(--muted-foreground); font-weight: 500;
    }

    a-button { display: block; width: 100%; }

    .footnote { margin: 0; font-size: 0.75em; color: var(--muted-foreground); }
  `

  protected render() {
    return html`
      <div class="stack">
        <div class="success-ring">
          <div class="ring-pulse"></div>
          <div class="ring-inner">
            <iconify-icon icon="lucide:check"></iconify-icon>
          </div>
        </div>

        <div class="message-group">
          <h2 class="title">Verification Successful</h2>
          <p class="subtitle">You're verified to use ${this.appName}</p>
        </div>

        <div class="level-card">
          <span class="level-label">Your Level</span>
          <verification-level-badge .level=${this.level} size="lg"></verification-level-badge>
        </div>

        <a-button size="lg" @click=${() => this._emit('continue')}>
          Continue to ${this.appName}
        </a-button>

        <p class="footnote">This verification can be used across multiple apps</p>
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
