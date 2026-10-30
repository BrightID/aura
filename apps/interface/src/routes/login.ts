import brightIDIcon from '@/assets/icons/brightid.svg';
import LockIcon from '@/assets/icons/lock.svg';
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
    .methods {
      display: grid;
      gap: 12px;
    }
    .methods a-button {
      width: 100%;
    }
    .methods a-button::part(button) {
      width: 100%;
      height: auto;
      min-height: 4.75rem;
      justify-content: flex-start;
      gap: 12px;
      padding: 16px;
      text-align: left;
    }
    .method-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      min-width: 0;
    }
    .method-copy img {
      flex-shrink: 0;
    }
    .method-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }
    .font-medium {
      font-weight: 600;
    }
    .text-xs {
      font-size: 13px;
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
    .form-footer a {
      color: var(--primary);
    }
    .loading-wrapper {
      min-height: 300px;
      display: grid;
      place-items: center;
      text-align: center;
    }
    @media (prefers-reduced-motion: reduce) {
      a-skeleton {
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
                      <a-head level="3">Signing in</a-head>
                      <a-skeleton style="width: 12rem; margin-top: 16px"></a-skeleton>
                    </div>
                  `
                : html`
                    <h2 class="form-title">Sign in to Aura</h2>
                    <p class="form-desc">
                      Use a passkey or connect BrightID to continue.
                    </p>

                    <div class="methods">
                      ${map(
                        this.authMethods,
                        (method) => html`
                          <a-button
                            variant="outline"
                            @click=${() => method.callback?.()}
                          >
                            <span class="method-row">
                              <img
                                width="20"
                                height="20"
                                src="${method.icon}"
                                alt=""
                              />
                              <span class="method-copy">
                                <span class="font-medium">${method.name}</span>
                                <span class="text-xs text-muted-foreground">
                                  ${method.description}
                                </span>
                              </span>
                            </span>
                          </a-button>
                        `,
                      )}
                    </div>

                    <p class="form-footer">
                      By signing in, you agree to our
                      <a href="/interface/privacy-policy">privacy policy</a>.
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
