import brightIDIcon from '@/assets/icons/brightid.svg'
import LockIcon from '@/assets/icons/lock.svg'
import { userBrightId } from '@/states/user'
import { hasStoredPasskey, loginWithPasskey, registerWithPasskey } from '@aura/sdk/auth/passkeys'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

type ConnectMethod = 'brightid' | 'passkey' | null

@customElement('verification-connect')
export class VerificationConnectElement extends LitElement {
  @state() private connecting: ConnectMethod = null
  @state() private error = ''

  static styles: CSSResultGroup = css`
    :host { display: block; font-size: inherit; }

    .stack { display: flex; flex-direction: column; gap: 1.25em; }

    /* Header */
    .header {
      text-align: center;
      display: flex; flex-direction: column;
      align-items: center; gap: 0.5em;
    }
    .logo-ring {
      width: 3em; height: 3em; border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .logo-ring svg { width: 1.75em; height: 1.75em; }
    .heading { margin: 0; font-size: 1.125em; font-weight: 600; color: var(--foreground); }
    .subheading { margin: 0; font-size: 0.875em; color: var(--muted-foreground); }

    /* Options */
    .options { display: flex; flex-direction: column; gap: 0.5em; }
    .option-btn {
      width: 100%; display: flex; align-items: center; gap: 0.75em;
      padding: 0.75em 1em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer; transition: background 0.15s; text-align: left;
    }
    .option-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .option-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .option-icon {
      width: 2.25em; height: 2.25em; flex-shrink: 0;
      border-radius: 0.5em;
      display: flex; align-items: center; justify-content: center;
    }
    .option-icon.brightid { background: rgba(237, 122, 92, 0.12); }
    .option-icon.passkey  { background: rgba(var(--primary-rgb, 99, 102, 241), 0.12); }
    .option-icon img { width: 1.25em; height: 1.25em; }
    .option-icon svg { width: 1.25em; height: 1.25em; color: var(--primary); }

    .option-text { flex: 1; }
    .option-name { font-size: 0.875em; font-weight: 500; color: var(--foreground); }
    .option-desc { font-size: 0.75em; color: var(--muted-foreground); margin-top: 0.125em; }

    .spinner {
      width: 1em; height: 1em; flex-shrink: 0;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 9999px;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Help */
    .help-btn {
      display: flex; align-items: center; justify-content: center; gap: 0.375em;
      width: 100%; background: none; border: none; cursor: pointer;
      font-size: 0.875em; color: var(--muted-foreground);
      padding: 0.25em; transition: color 0.15s;
    }
    .help-btn:hover { color: var(--foreground); }
    .help-btn svg { width: 1em; height: 1em; flex-shrink: 0; }

    /* Trust row */
    .trust-row {
      padding-top: 0.75em;
      border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      gap: 1em; flex-wrap: wrap;
    }
    .trust-item {
      display: flex; align-items: center; gap: 0.25em;
      font-size: 0.75em; color: var(--muted-foreground);
    }
    .trust-item svg { width: 0.875em; height: 0.875em; flex-shrink: 0; }

    /* Error */
    .error-msg {
      padding: 0.625em 0.75em;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 0.5em;
      font-size: 0.75em;
      color: var(--destructive);
    }
  `

  protected render() {
    const isConnecting = this.connecting !== null

    return html`
      <div class="stack">
        <div class="header">
          <div class="logo-ring">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" stroke="#a0dba0" stroke-width="2" opacity="0.4"/>
              <circle cx="16" cy="16" r="10" stroke="#c8e6c8" stroke-width="2" opacity="0.6"/>
              <circle cx="16" cy="16" r="6" fill="#ffd700"/>
              <circle cx="16" cy="16" r="3" fill="#ff8c00"/>
            </svg>
          </div>
          <h2 class="heading">Connect to Aura</h2>
          <p class="subheading">Verify your unique humanity to continue</p>
        </div>

        <div class="options">
          <button class="option-btn" ?disabled=${isConnecting} @click=${() => this._connectBrightID()}>
            <div class="option-icon brightid">
              <img src=${brightIDIcon} alt="BrightID" />
            </div>
            <div class="option-text">
              <div class="option-name">BrightID</div>
              <div class="option-desc">
                ${this.connecting === 'brightid' ? 'Opening BrightID…' : 'Connect with existing identity'}
              </div>
            </div>
            ${this.connecting === 'brightid' ? html`<div class="spinner"></div>` : ''}
          </button>

          <button class="option-btn" ?disabled=${isConnecting} @click=${() => this._connectPasskey()}>
            <div class="option-icon passkey">
              <img src=${LockIcon} alt="Passkey" />
            </div>
            <div class="option-text">
              <div class="option-name">Passkey</div>
              <div class="option-desc">
                ${this.connecting === 'passkey' ? 'Authenticating…' : 'Create or use existing passkey'}
              </div>
            </div>
            ${this.connecting === 'passkey' ? html`<div class="spinner"></div>` : ''}
          </button>
        </div>

        ${this.error ? html`<p class="error-msg">${this.error}</p>` : ''}

        <button class="help-btn" @click=${() => this._emit('how-it-works')}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          What is Aura?
        </button>

        <div class="trust-row">
          <span class="trust-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Decentralized
          </span>
          <span class="trust-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Privacy-First
          </span>
          <span class="trust-item">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>
            Open Network
          </span>
        </div>
      </div>
    `
  }

  private async _connectPasskey() {
    this.connecting = 'passkey'
    this.error = ''
    try {
      if (hasStoredPasskey()) {
        await loginWithPasskey({ mode: 'cached' })
      } else {
        await registerWithPasskey({ mode: 'cached', username: `aura-${new Date().toISOString()}` })
      }
      this._emit('connected')
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Passkey authentication failed'
    } finally {
      this.connecting = null
    }
  }

  private _connectBrightID() {
    this.connecting = 'brightid'
    window.open('https://brightid.gitbook.io/aura/getting-started/get-brightid', '_blank')
    setTimeout(() => {
      this.connecting = null
      if (userBrightId.get()) this._emit('connected')
    }, 2000)
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
