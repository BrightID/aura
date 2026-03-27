import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './level-badge'

const levelDescriptions: Record<number, string> = {
  1: 'Basic verification for general access',
  2: 'Enhanced verification for trusted features',
  3: 'Premium verification for full access'
}

@customElement('verification-intro')
export class IntroStep extends LitElement {
  @property() appName = ''
  @property() appDescription?: string
  @property() appLogo?: string
  @property({ type: Number }) requiredLevel: 1 | 2 | 3 = 1

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

    /* App header */
    .header {
      display: flex;
      align-items: flex-start;
      gap: 0.75em;
    }
    .app-logo-img {
      width: 3em;
      height: 3em;
      flex-shrink: 0;
      border-radius: var(--radius, 0.75rem);
      object-fit: cover;
    }
    .app-logo-text {
      width: 3em;
      height: 3em;
      flex-shrink: 0;
      border-radius: var(--radius, 0.75rem);
      background: var(--secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125em;
      font-weight: bold;
      color: var(--foreground);
    }
    .header-info {
      flex: 1;
      min-width: 0;
    }
    .app-name {
      margin: 0 0 0.25em;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .app-desc {
      margin: 0;
      font-size: 0.875em;
      color: var(--muted-foreground);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* Requirement card */
    .req-card {
      padding: 1em;
      background: var(--secondary);
      border-radius: var(--radius, 0.75rem);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 0.75em;
    }
    .req-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .req-label {
      font-size: 0.875em;
      color: var(--muted-foreground);
    }
    .req-desc {
      margin: 0;
      font-size: 0.875em;
      color: var(--foreground);
    }

    /* Aura info card */
    .aura-card {
      padding: 1em;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.05);
      border-radius: var(--radius, 0.75rem);
      border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.12);
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .aura-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .aura-logo {
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
    }
    .aura-title {
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
    }
    .aura-desc {
      margin: 0;
      font-size: 0.875em;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .learn-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      font-size: 0.875em;
      color: var(--primary);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: opacity 0.15s;
    }
    .learn-btn:hover {
      opacity: 0.75;
    }
    .learn-btn iconify-icon {
      flex-shrink: 0;
    }

    .trust-note {
      margin: 0;
      font-size: 0.75em;
      text-align: center;
      color: var(--muted-foreground);
    }

    .logo {
      width: 3rem;
      height: 3rem;
    }
  `

  protected render() {
    return html`
      <div class="stack">
        <div class="header">
          ${this.appLogo
            ? html`<img src=${this.appLogo} alt=${this.appName} class="app-logo-img" />`
            : html`<div class="app-logo-text">${this.appName.charAt(0)}</div>`}
          <div class="header-info">
            <h2 class="app-name">${this.appName}</h2>
            <p class="app-desc">${this.appDescription}</p>
          </div>
        </div>

        <div class="req-card">
          <div class="req-header">
            <span class="req-label">Required Verification</span>
            <verification-level-badge
              .level=${this.requiredLevel}
              size="sm"
            ></verification-level-badge>
          </div>
          <p class="req-desc">${levelDescriptions[this.requiredLevel]}</p>
        </div>

        <div class="aura-card">
          <div class="aura-header">
            <img src="/aura2.png" class="logo" alt="Aura" />
            <span class="aura-title">Powered by Aura</span>
          </div>
          <p class="aura-desc">
            Aura is a decentralized network that verifies your unique humanity without exposing
            personal information.
          </p>
          <button class="learn-btn" @click=${() => this._emit('how-it-works')}>
            Learn how it works
            <iconify-icon icon="lucide:chevron-right" width="1em" height="1em"></iconify-icon>
          </button>
        </div>

        <a-button size="md" @click=${() => this._emit('continue')}>
          <span>Verify with Aura</span>
        </a-button>

        <p class="trust-note">
          Your identity stays private. ${this.appName} only sees your verification level.
        </p>
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
