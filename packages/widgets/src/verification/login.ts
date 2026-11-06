import { icon } from '../icon';
import { LightElement } from '../light-element';
import brightIDIcon from '@/assets/icons/brightid.svg';
import LockIcon from '@/assets/icons/lock.svg';
import { userBrightId } from '@/states/user';
import { loginWithPasskey, registerWithPasskey } from '@aura/sdk/auth/passkeys';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './brightid-qr';
import './level-badge';
import './shared-styles.css';
import './login.css';

type ConnectMethod = 'brightid' | 'passkey' | null;
type View = 'options' | 'brightid-qr' | 'passkey-choice';

const levelDescriptions: Record<number, string> = {
  1: 'Basic verification for general access',
  2: 'Enhanced verification for trusted features',
  3: 'Premium verification for full access',
  4: 'Highest verification tier',
};

@customElement('verification-connect')
export class VerificationConnectElement extends LightElement {
  @property() appName = '';
  @property() appDescription?: string;
  @property() appLogo?: string;
  @property({ type: Number }) requiredLevel: 1 | 2 | 3 | 4 = 1;

  @state() private connecting: ConnectMethod = null;
  @state() private view: View = 'options';
  @state() private error = '';

  protected render() {
    if (this.view === 'brightid-qr') {
      return html`
        <verification-brightid-qr
          @connected=${() => this._handleBrightIDConnected()}
          @back=${() => {
            this.view = 'options';
          }}
        ></verification-brightid-qr>
      `;
    }

    if (this.view === 'passkey-choice') {
      return this._renderPasskeyChoice();
    }

    const isConnecting = this.connecting !== null;

    return html`
      <div class="stack">
        ${
          this.appName
            ? html`
                <div class="app-header">
                  ${
                    this.appLogo
                      ? html`<img
                          src=${this.appLogo}
                          alt=${this.appName}
                          class="app-logo-img"
                        />`
                      : html`<div class="app-logo-text">
                          ${this.appName.charAt(0)}
                        </div>`
                  }
                  <div class="app-info">
                    <h2 class="app-name">${this.appName}</h2>
                    ${
                      this.appDescription
                        ? html`<p class="app-desc">${this.appDescription}</p>`
                        : ''
                    }
                  </div>
                </div>

                <div class="req-card">
                  <div class="req-card-text">
                    <div class="req-label">Required verification</div>
                    <p class="req-desc">
                      ${levelDescriptions[this.requiredLevel]}
                    </p>
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
                  <p class="subheading">
                    Verify your unique humanity to continue
                  </p>
                </div>
              `
        }

        <p class="options-label">Continue with</p>
        <div class="options">
          <button
            class="option-btn"
            ?disabled=${isConnecting}
            @click=${() => {
              this.view = 'passkey-choice';
            }}
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
            @click=${() => {
              this.view = 'brightid-qr';
            }}
          >
            <div class="option-icon brightid">
              <img src=${brightIDIcon} alt="BrightID" />
            </div>
            <div class="option-text">
              <div class="option-name">BrightID</div>
              <div class="option-desc">
                Connect with existing identity via QR code
              </div>
            </div>
          </button>
        </div>

        ${this.error ? html`<p class="error-msg">${this.error}</p>` : ''}

        <button class="help-btn" @click=${() => this._emit('how-it-works')}>
          ${icon('lucide:info')} What is Aura?
        </button>

        <div class="trust-row">
          <span class="trust-item">
            ${icon('lucide:shield-check')} Decentralized
          </span>
          <span class="trust-item"> ${icon('lucide:lock')} Privacy-First </span>
          <span class="trust-item"> ${icon('lucide:globe')} Open Network </span>
        </div>
      </div>
    `;
  }

  private _renderPasskeyChoice() {
    const isConnecting = this.connecting !== null;
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

        <button
          class="help-btn"
          @click=${() => {
            this.view = 'options';
            this.error = '';
          }}
        >
          ${icon('lucide:chevron-left')} Back
        </button>
      </div>
    `;
  }

  private async _loginExistingPasskey() {
    this.connecting = 'passkey';
    this.error = '';
    try {
      const passkey = await loginWithPasskey({ mode: 'cached' });
      userBrightId.set(passkey.publicKeyBase64);
      this._emit('connected');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Passkey login failed';
    } finally {
      this.connecting = null;
    }
  }

  private async _registerNewPasskey() {
    this.connecting = 'passkey';
    this.error = '';
    try {
      localStorage.removeItem('brightid_cred_id');
      localStorage.removeItem('brightid_pub_key');
      localStorage.removeItem('brightid_seed');
      const passkey = await registerWithPasskey({
        mode: 'cached',
        username: `aura-${new Date().toISOString()}`,
      });
      userBrightId.set(passkey.publicKeyBase64);
      this._emit('connected');
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : 'Passkey registration failed';
    } finally {
      this.connecting = null;
    }
  }

  private _handleBrightIDConnected() {
    this.view = 'options';
    this._emit('connected');
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
