import brightIDIcon from '@/assets/icons/brightid.svg';
import LockIcon from '@/assets/icons/lock.svg';
import spinnerIcon from '@/assets/icons/spinner.svg';
import { pushRouter } from '@/router';
import { isLoginLoading } from '@/states/login';
import { loginWithPasskey, registerWithPasskey } from '@aura/sdk/auth/passkeys';
import { SignalWatcher } from '@lit-labs/signals';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import '@/components/landing/footer-section';
import '@/components/landing/hero-section';
import { userBrightId } from '@/states/user';

interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
  callback?: CallableFunction;
}

@customElement('login-page')
export class LoginPageElement extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
    }
    * {
      box-sizing: border-box;
    }
    .wrapper {
      max-width: 440px;
      margin: 0 auto;
    }
    .container {
      width: 100%;
    }
    .form-container {
      margin: 28px 0;
      text-align: left;
    }
    .form-title {
      margin: 0;
      font-size: 24px;
      letter-spacing: -0.03em;
      color: var(--foreground);
    }
    .form-desc {
      margin: 8px 0 24px;
      color: var(--muted-foreground);
      font-size: 14px;
    }
    .space-y-3 {
      display: grid;
      gap: 12px;
    }
    .button {
      width: 100%;
      min-height: 76px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--secondary);
      color: var(--foreground);
      font: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        background 160ms ease,
        border-color 160ms ease;
    }
    .button:hover {
      background: var(--muted);
      border-color: var(--primary);
    }
    .button:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 4px;
    }
    .flex-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .flex-container img {
      flex-shrink: 0;
    }
    .font-medium {
      font-weight: 600;
    }
    .text-xs {
      font-size: 13px;
      margin-top: 4px;
    }
    .text-muted-foreground,
    .form-footer {
      color: var(--muted-foreground);
    }
    .form-footer {
      font-size: 12px;
      text-align: center;
      margin: 24px 0 0;
    }
    .loading-wrapper {
      min-height: 300px;
      display: grid;
      place-items: center;
      text-align: center;
    }
    .loading-wrapper img {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .button {
        transition: none;
      }
      .loading-wrapper img {
        animation: none;
      }
    }
  `;
  authMethods: AuthMethod[] = [
    {
      id: 'passkey',
      name: 'Login with Passkey',
      icon: LockIcon,
      description: 'Sign in with Passkeys',
      callback: this.loginExistingPasskey.bind(this),
    },
    {
      id: 'register-passkey',
      name: 'Register Passkey',
      icon: LockIcon,
      description: 'Register a new Passkey',
      callback: this.registerNewPasskey.bind(this),
    },
    {
      id: 'brightid',
      name: 'BrightID',
      icon: brightIDIcon,
      description: 'Decentralized identity verification',
      callback: this.signWithBrightID,
    },
  ];

  protected render() {
    return html`
      <div class="wrapper">
        <hero-section></hero-section>

        <div class="container">
          <a-card variant="default" class="form-container">
            ${
              isLoginLoading.get()
                ? html`
                    <div class="loading-wrapper">
                      <div>
                        <h2>Signing In</h2>
                        <img
                          width="25"
                          height="25"
                          src="${spinnerIcon}"
                          alt="spinner"
                        />
                      </div>
                    </div>
                  `
                : html`
                    <h2 class="form-title">Sign In</h2>
                    <p class="form-desc">
                      Choose how you’d like to access your account.
                    </p>

                    <div class="space-y-3">
                      ${map(
                        this.authMethods,
                        (method) => html`
                          <div class="space-y-2">
                            <button
                              class="button"
                              @click=${() => method.callback?.()}
                            >
                              <div class="flex-container">
                                <img
                                  width="20"
                                  height="20"
                                  src="${method.icon}"
                                  alt="${method.name}"
                                />
                                <div class="flex-1">
                                  <div class="font-medium">${method.name}</div>
                                  <div class="text-xs text-muted-foreground">
                                    ${method.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        `,
                      )}
                    </div>

                    <p class="form-footer">
                      By signing in, you agree to our privacy policy.
                    </p>
                  `
            }
          </a-card>
        </div>

        <footer-section></footer-section>
      </div>
    `;
  }

  protected signWithBrightID() {
    pushRouter('/brightid');
  }

  protected async loginExistingPasskey() {
    isLoginLoading.set(true);
    try {
      localStorage.removeItem('brightid_cred_id');

      const key = await loginWithPasskey({ mode: 'cached' });
      userBrightId.set(key.publicKeyBase64);
      pushRouter('/home');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Passkey login failed');
    } finally {
      isLoginLoading.set(false);
    }
  }

  protected async registerNewPasskey() {
    isLoginLoading.set(true);
    try {
      // Clear stored keys so registerWithPasskey treats this as first time
      localStorage.removeItem('brightid_cred_id');
      localStorage.removeItem('brightid_pub_key');
      localStorage.removeItem('brightid_seed');

      const key = await registerWithPasskey({
        mode: 'cached',
        username: `aura-${new Date().toISOString()}`,
      });
      userBrightId.set(key.publicKeyBase64);
      pushRouter('/home');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Passkey login failed');
    } finally {
      isLoginLoading.set(false);
    }
  }
}
