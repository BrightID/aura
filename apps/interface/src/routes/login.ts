import { LightElement } from '@aura/widgets/light-element';
import brightIDIcon from '@/assets/icons/brightid.svg';
import LockIcon from '@/assets/icons/lock.svg';
import { pushRouter } from '@/router';
import { isLoginLoading } from '@/states/login';
import { loginWithPasskey, registerWithPasskey } from '@aura/sdk/auth/passkeys';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import '@/components/landing/footer-section';
import '@/components/landing/hero-section';
import { userBrightId } from '@/states/user';
import './login.css';

interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
  callback?: CallableFunction;
}

@customElement('login-page')
export class LoginPageElement extends SignalWatcher(LightElement) {
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
          <div class="a-card form-container" data-variant="default">
            ${
              isLoginLoading.get()
                ? html`
                    <div class="loading-wrapper">
                      <h3 class="a-head" data-level="3">Signing in</h3>
                      <div
                        class="a-skeleton"
                        style="width: 12rem; margin-top: 16px"
                      ></div>
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
                          <button
                            class="a-button"
                            type="button"
                            data-variant="outline"
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
                          </button>
                        `,
                      )}
                    </div>

                    <p class="form-footer">
                      By signing in, you agree to our
                      <a href="/interface/privacy-policy">privacy policy</a>.
                    </p>
                  `
            }
          </div>
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
