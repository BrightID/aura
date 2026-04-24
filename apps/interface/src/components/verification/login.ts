import brightIDIcon from '@/assets/icons/brightid.svg'
import LockIcon from '@/assets/icons/lock.svg'
import { userBrightId } from '@/states/user'
import {
  hasStoredPasskey,
  loginWithPasskey,
  PublicIdentity,
  registerWithPasskey
} from '@aura/sdk/auth/passkeys'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './brightid-qr'
import './level-badge'

type ConnectMethod = 'brightid' | 'passkey' | null
type View = 'options' | 'brightid-qr' | 'passkey-choice'

const levelDescriptions: Record<number, string> = {
  1: 'Basic verification for general access',
  2: 'Enhanced verification for trusted features',
  3: 'Premium verification for full access',
  4: 'Highest verification tier'
}

@customElement('verification-connect')
export class VerificationConnectElement extends LitElement {
  @property() appName = ''
  @property() appDescription?: string
  @property() appLogo?: string
  @property({ type: Number }) requiredLevel: 1 | 2 | 3 | 4 = 1

  @state() private connecting: ConnectMethod = null
  @state() private view: View = 'options'
  @state() private error = ''

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }

    .logo {
      width: 5rem;
      height: 5rem;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 1.25em;
    }

    /* Header */
    .header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5em;
    }
    .logo-ring {
      width: 3em;
      height: 3em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-ring svg {
      width: 1.75em;
      height: 1.75em;
    }
    .heading {
      margin: 0;
      font-size: 1.125em;
      font-weight: 600;
      color: var(--foreground);
    }
    .subheading {
      margin: 0;
      font-size: 0.875em;
      color: var(--muted-foreground);
    }

    /* Options */
    .options {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .option-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.75em 1em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
    }
    .option-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .option-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .option-icon {
      width: 2.25em;
      height: 2.25em;
      flex-shrink: 0;
      border-radius: 0.5em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .option-icon.brightid {
      background: rgba(237, 122, 92, 0.12);
    }
    .option-icon.passkey {
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
    }
    .option-icon img {
      width: 1.25em;
      height: 1.25em;
    }
    .option-icon svg {
      width: 1.25em;
      height: 1.25em;
      color: var(--primary);
    }

    .option-text {
      flex: 1;
    }
    .option-name {
      font-size: 0.9em;
      font-weight: 500;
      color: var(--foreground);
    }
    .option-desc {
      font-size: 0.9em;
      color: var(--muted-foreground);
      margin-top: 0.125em;
    }

    .spinner {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 9999px;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Help */
    .help-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375em;
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875em;
      color: var(--muted-foreground);
      padding: 0.25em;
      transition: color 0.15s;
    }
    .help-btn:hover {
      color: var(--foreground);
    }
    .help-btn iconify-icon {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }

    /* Trust row */
    .trust-row {
      padding-top: 0.75em;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1em;
      flex-wrap: wrap;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.25em;
      font-size: 0.75em;
      color: var(--muted-foreground);
    }
    .trust-item iconify-icon {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }

    /* Error */
    .error-msg {
      padding: 0.625em 0.75em;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 0.5em;
      font-size: 0.75em;
      color: var(--destructive);
    }

    /* App header (merged from intro) */
    .app-header {
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
    .app-info {
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

    /* Required verification card */
    .req-card {
      padding: 0.75em 0.875em;
      background: var(--secondary);
      border-radius: var(--radius, 0.75rem);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75em;
    }
    .req-card-text {
      flex: 1;
      min-width: 0;
    }
    .req-label {
      font-size: 0.7em;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .req-desc {
      margin: 0.2em 0 0;
      font-size: 0.8em;
      color: var(--foreground);
    }

    /* Options heading */
    .options-label {
      font-size: 0.7em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0.25em 0 -0.25em;
    }
  `

  protected render() {
    if (this.view === 'brightid-qr') {
      return html`
        <verification-brightid-qr
          @connected=${() => this._handleBrightIDConnected()}
          @back=${() => { this.view = 'options' }}
        ></verification-brightid-qr>
      `
    }

    if (this.view === 'passkey-choice') {
      return this._renderPasskeyChoice()
    }

    const isConnecting = this.connecting !== null

    return html`
      <div class="stack">
        ${this.appName
          ? html`
              <div class="app-header">
                ${this.appLogo
                  ? html`<img src=${this.appLogo} alt=${this.appName} class="app-logo-img" />`
                  : html`<div class="app-logo-text">${this.appName.charAt(0)}</div>`}
                <div class="app-info">
                  <h2 class="app-name">${this.appName}</h2>
                  ${this.appDescription
                    ? html`<p class="app-desc">${this.appDescription}</p>`
                    : ''}
                </div>
              </div>

              <div class="req-card">
                <div class="req-card-text">
                  <div class="req-label">Required verification</div>
                  <p class="req-desc">${levelDescriptions[this.requiredLevel]}</p>
                </div>
                <verification-level-badge
                  .level=${this.requiredLevel}
                  size="sm"
                ></verification-level-badge>
              </div>
            `
          : html`
              <div class="header">
                <img src="/aura2.png" class="logo" alt="Aura" />
                <h2 class="heading">Connect to Aura</h2>
                <p class="subheading">Verify your unique humanity to continue</p>
              </div>
            `}

        <p class="options-label">Continue with</p>
        <div class="options">
          <button
            class="option-btn"
            ?disabled=${isConnecting}
            @click=${() => { this.view = 'passkey-choice' }}
          >
            <div class="option-icon passkey">
              <img src=${LockIcon} alt="Passkey" />
            </div>
            <div class="option-text">
              <div class="option-name">Passkey</div>
              <div class="option-desc">Create or use existing passkey</div>
            </div>
          </button>

          <button
            class="option-btn"
            ?disabled=${isConnecting}
            @click=${() => { this.view = 'brightid-qr' }}
          >
            <div class="option-icon brightid">
              <img src=${brightIDIcon} alt="BrightID" />
            </div>
            <div class="option-text">
              <div class="option-name">BrightID</div>
              <div class="option-desc">Connect with existing identity via QR code</div>
            </div>
          </button>
        </div>

        ${this.error ? html`<p class="error-msg">${this.error}</p>` : ''}

        <button class="help-btn" @click=${() => this._emit('how-it-works')}>
          <iconify-icon icon="lucide:info"></iconify-icon>
          What is Aura?
        </button>

        <div class="trust-row">
          <span class="trust-item">
            <iconify-icon icon="lucide:shield-check"></iconify-icon>
            Decentralized
          </span>
          <span class="trust-item">
            <iconify-icon icon="lucide:lock"></iconify-icon>
            Privacy-First
          </span>
          <span class="trust-item">
            <iconify-icon icon="lucide:globe"></iconify-icon>
            Open Network
          </span>
        </div>
      </div>
    `
  }

  private _renderPasskeyChoice() {
    const isConnecting = this.connecting !== null
    return html`
      <div class="stack">
        <div class="header">
          <img src="/aura2.png" class="logo" alt="Aura" />
          <h2 class="heading">Passkey</h2>
          <p class="subheading">Choose an option to continue</p>
        </div>

        <div class="options">
          <button
            class="option-btn"
            ?disabled=${isConnecting}
            @click=${() => this._loginExistingPasskey()}
          >
            <div class="option-icon passkey">
              <img src=${LockIcon} alt="Login" />
            </div>
            <div class="option-text">
              <div class="option-name">Existing Account</div>
              <div class="option-desc">
                ${this.connecting === 'passkey' ? 'Authenticating…' : 'Sign in with your saved passkey'}
              </div>
            </div>
            ${this.connecting === 'passkey' ? html`<div class="spinner"></div>` : ''}
          </button>

          <button
            class="option-btn"
            ?disabled=${isConnecting}
            @click=${() => this._registerNewPasskey()}
          >
            <div class="option-icon passkey">
              <img src=${LockIcon} alt="Register" />
            </div>
            <div class="option-text">
              <div class="option-name">New Account</div>
              <div class="option-desc">
                ${this.connecting === 'passkey' ? 'Registering…' : 'Create a new passkey account'}
              </div>
            </div>
            ${this.connecting === 'passkey' ? html`<div class="spinner"></div>` : ''}
          </button>
        </div>

        ${this.error ? html`<p class="error-msg">${this.error}</p>` : ''}

        <button class="help-btn" @click=${() => { this.view = 'options'; this.error = '' }}>
          <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          Back
        </button>
      </div>
    `
  }

  private async _loginExistingPasskey() {
    this.connecting = 'passkey'
    this.error = ''
    try {
      const passkey = await loginWithPasskey({ mode: 'cached' })
      userBrightId.set(passkey.publicKeyBase64)
      this._emit('connected')
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Passkey login failed'
    } finally {
      this.connecting = null
    }
  }

  private async _registerNewPasskey() {
    this.connecting = 'passkey'
    this.error = ''
    try {
      localStorage.removeItem('brightid_cred_id')
      localStorage.removeItem('brightid_pub_key')
      localStorage.removeItem('brightid_seed')
      const passkey = await registerWithPasskey({
        mode: 'cached',
        username: `aura-${new Date().toISOString()}`
      })
      userBrightId.set(passkey.publicKeyBase64)
      this._emit('connected')
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Passkey registration failed'
    } finally {
      this.connecting = null
    }
  }

  private _handleBrightIDConnected() {
    this.view = 'options'
    this._emit('connected')
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
