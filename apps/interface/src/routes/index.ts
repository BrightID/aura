import { LightElement } from '@aura/widgets/light-element';
import appleIcon from '@/assets/icons/apple.svg';
import brightIDIcon from '@/assets/icons/brightid.svg';
import externalLinkIcon from '@/assets/icons/external-link.svg';
import googleIcon from '@/assets/icons/google.svg';
import spinnerIcon from '@/assets/icons/spinner.svg';
import WalletIcon from '@/assets/icons/wallet.svg';
import { auth } from '@/lib/firebase';
import { pushRouter } from '@/router';
import { inputText, isLoginLoading } from '@/states/login';
import {
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userPhoneNumber,
  userProfilePicture,
} from '@/states/user';
import { clientAPI } from '@/utils/apis';
import { wagmiConfig } from '@/utils/wallet';
import { SignalWatcher } from '@lit-labs/signals';
import { Connector, signMessage } from '@wagmi/core';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { Address } from 'viem';
import './index.css';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const appleSignInOptions = {
  clientID: 'org.brightid.get-verified',
  // NOTE: must match whatever redirect URI is registered for this app in
  // the Apple Developer Console — update that registration once the new
  // unified domain is live.
  redirectUri: `${window.location.origin}/interface/sign-in-with-apple`,
  state: generateUUID(),
  responseMode: 'form_post',
  scope: 'name email',
} as const;

declare const AppleID: any;

export const signingMessage =
  'Account Responsibility Notice\nYou are using Aura verified. By signing this message, you confirm ownership of your account. You are responsible for protecting your account and private keys. Keep them secure and do not share them with anyone.';

interface AuthMethod {
  id: string;
  name: string;
  icon: string;
  setupTime: string;
  security: number;
  description: string;
  color: string;
  callback?: CallableFunction;
}

@customElement('home-page')
export class LoginPage extends SignalWatcher(LightElement) {
  @property({
    type: Boolean,
  })
  withoutTitle: boolean = false;

  constructor() {
    super();
    try {
      AppleID.auth.init({
        clientId: appleSignInOptions.clientID,
        scope: appleSignInOptions.scope,
        redirectURI: appleSignInOptions.redirectUri,
        state: appleSignInOptions.state,
        usePopup: true,
      });
    } catch (e) {
      console.warn('Error in setting up apple auth init', e);
    }

    if (userBrightId.get()) {
      pushRouter('/home');
    }
  }

  private onInputChange(e: Event) {
    const target = e.target as HTMLInputElement;

    inputText.set(target.value);
  }

  private async createBrightId(email: string) {
    const res = await clientAPI.POST('/login', {
      body: {
        email,
        integration: 'email',
      },
    });

    if (res.response.status === 200 && res.data) {
      userEmail.set(email);

      const { id } = res.data;

      userBrightId.set(id);
      return id;
    }

    throw new Error('Failed to create BrightID' + res.error);
  }

  private async onSubmit() {
    isLoginLoading.set(true);
    const email = inputText.get();
    try {
      const res = await this.createBrightId(email);

      if (res && !this.withoutTitle) {
        pushRouter('/home');
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoginLoading.set(false);
    }
  }

  private async signInWithGoogle() {
    isLoginLoading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      if (!res.user) {
        isLoginLoading.set(false);
        return;
      }

      userEmail.set(res.user.email!);

      const id = await this.createBrightId(userEmail.get());

      const [firstName, lastName] = res.user.displayName?.split(' ') ?? [];

      userFirstName.set(firstName ?? 'Unknown');
      userLastName.set(lastName ?? '');
      userProfilePicture.set(res.user.photoURL ?? '');
      userPhoneNumber.set(res.user.phoneNumber ?? '');

      if (!this.withoutTitle) pushRouter('/home');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      isLoginLoading.set(false);
    }
  }

  private async signInWithBrightID() {
    if (!this.withoutTitle) {
      pushRouter('/brightid');
      return;
    }

    this.dispatchEvent(
      new CustomEvent('onBrightLogin', { bubbles: true, composed: true }),
    );
  }

  private async signInWithApple() {
    isLoginLoading.set(true);
    try {
      const data = await AppleID.auth.signIn();

      if (!data.authorization) {
        throw new Error('Authorization data is missing');
      }

      const email = data.authorization.user?.email;
      const firstName = data.authorization.user?.name?.firstName;
      const lastName = data.authorization.user?.name?.lastName;

      if (!email) {
        throw new Error('Email is required for registration');
      }

      userEmail.set(email);
      const id = await this.createBrightId(email);

      userBrightId.set(id);
      if (firstName) userFirstName.set(firstName);
      if (lastName) userLastName.set(lastName);
      userProfilePicture.set('');
      userPhoneNumber.set('');

      pushRouter('/home');
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      isLoginLoading.set(false);
    }
  }

  private async requestEthereumSignature(
    address: Address,
    connector: Connector,
  ) {
    const now = new Date();

    const formattedDate = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    });

    const message = `Wallet: ${address}\nDate: ${formattedDate}\nConfirmation: ${signingMessage}`;

    const hashResult = await signMessage(wagmiConfig, {
      message,
      account: address,
      connector,
    });

    const res = await clientAPI.POST('/login-with-ethereum', {
      body: {
        hashed: hashResult,
        message,
      },
    });

    if (!res.data) return;

    const data = res.data as { id: string };

    userBrightId.set(data.id);
  }

  private async signInWithEthereum() {
    isLoginLoading.set(true);

    try {
      const connector = wagmiConfig.connectors[0];

      const res = await connector?.connect({
        chainId: 1,
      });

      if (!res?.accounts[0]) return;

      await this.requestEthereumSignature(res.accounts[0], connector!);

      pushRouter('/complete-profile');
    } catch (e) {
      console.log('Error connecting to wallet:', e);
    } finally {
      isLoginLoading.set(false);
    }
  }

  authMethods: AuthMethod[] = [
    {
      id: 'google',
      name: 'Google',
      icon: googleIcon,
      setupTime: '30s',
      security: 2,
      description: 'Sign in with your Google account',
      color: 'bg-red-50 text-red-700 border-red-200',
      callback: this.signInWithGoogle.bind(this),
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: appleIcon,
      setupTime: '45s',
      security: 3,
      description: 'Sign in with Apple ID',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      callback: this.signInWithApple.bind(this),
    },
    {
      id: 'ethereum',
      name: 'Ethereum Wallet',
      icon: WalletIcon,
      setupTime: '2m',
      security: 4,
      description: 'Connect your crypto wallet',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      callback: () => this.signInWithEthereum(),
    },
    {
      id: 'brightid',
      name: 'BrightID',
      icon: brightIDIcon,
      setupTime: '3m',
      security: 10,
      description: 'Decentralized identity verification',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      callback: this.signInWithBrightID,
    },
  ];

  render() {
    if (this.withoutTitle) {
      return html` <div class="">
        ${
          isLoginLoading.get()
            ? html`
                <div class="loading-wrapper">
                  <div>
                    <h2>Signing Up</h2>
                    <img src="${spinnerIcon}" alt="spinner" />
                  </div>
                </div>
              `
            : html`
                <h2 class="form-title">Sign In</h2>
                <p class="form-desc">Use one of these integrations to login</p>
                <input
                  class="a-input mb-2"
                  .value=${inputText.get()}
                  @input=${this.onInputChange}
                  type="email"
                  placeholder="Enter your email"
                />

                <div class="btn-wrapper">
                  <button
                    class="a-button"
                    type="button"
                    data-size="lg"
                    style="width: 100%"
                    @click=${this.onSubmit}
                    .disabled=${isLoginLoading.get()}
                  >
                    Sign in with Email
                  </button>
                  <div class="btn-info">
                    <span
                      class="a-badge security-3"
                      data-size="xs"
                      data-variant="outline"
                      style="opacity: 0.5"
                    >
                      <span>🛡️</span><span>3/10</span>
                    </span>
                    <span class="a-badge" data-size="xs" data-variant="outline">
                      <span>🕒</span><span>Setup: +1m</span>
                    </span>
                  </div>
                </div>

                <div class="mini-divider">Or</div>

                <div class="mini-integrations">
                  <div class="mini-integration-wrapper">
                    ${map(
                      this.authMethods,
                      (method) => html`
                        <div class="space-y-2">
                          <button
                            class="a-button mini-button"
                            type="button"
                            data-variant="ghost"
                            data-size="sm"
                            @click=${() => method.callback?.()}
                          >
                            <img
                              width="20"
                              height="20"
                              src="${method.icon}"
                              alt="${method.name}"
                            />
                          </button>
                          <div class="badge-container mini">
                            <span
                              class="a-badge security-${method.security}"
                              data-size="xs"
                              data-variant="outline"
                            >
                              <span>🛡️</span>
                              <span>${method.security}/10</span>
                            </span>
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                </div>
              `
        }
      </div>`;
    }

    return html`
      <div class="wrapper">
        <img
          src="${import.meta.env.BASE_URL}aura2.png"
          class="logo"
          alt="Aura"
        />

        <div class="container">
          <h1 class="title">Aura Verified</h1>
          <p class="info-text">Decentralized verification platform</p>

          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            class="desc-btn"
          >
            <span>What is Aura?</span>
            <img src=${externalLinkIcon} alt="Aura" />
          </a>

          <div class="a-card form-container">
            <div class="lamp-light"></div>

            ${
              isLoginLoading.get()
                ? html`
                    <div class="loading-wrapper">
                      <div>
                        <h2>Signing Up</h2>
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
              <p class="form-desc">Use one of these integrations to login</p>
              <input
                  class="a-input mb-2"
                  .value=${inputText.get()}
                  @input=${this.onInputChange}
                  type="email"
                  placeholder="Enter your email"
                />

              <div class="btn-wrapper">
                <button class="a-button" type="button" data-size="lg" style="width: 100%" @click=${this.onSubmit} .disabled=${isLoginLoading.get()}>
                  Sign in with Email
                </button>

                <div class="btn-info">
                  <span class="a-badge security-3" data-size="xs" data-variant="outline">
                    <span>🛡️</span><span>3/10</span>
                  </span>
                  <span class="a-badge" data-size="xs" data-variant="outline">
                    <span>🕒</span><span>~1 min</span>
                  </span>
                </div>
              </div>

              <hr class="a-separator my-6">

              <div class="space-y-3">
                ${map(
                  this.authMethods,
                  (method) => html`
                    <div class="space-y-2">
                      <button
                        class="a-button"
                        type="button"
                        data-variant="secondary"
                        style="width: 100%; height: 3.75rem; justify-content: flex-start; padding: 0 1.25rem; display: flex"
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

                      <div class="badge-container">
                        <span
                          class="a-badge"
                          data-size="xs"
                          style="color: ${method.color}"
                        >
                          <span>🕒</span>
                          <span>Setup time: + ${method.setupTime}</span>
                        </span>
                        <span
                          class="a-badge security-${method.security}"
                          data-size="xs"
                          data-variant="outline"
                        >
                          <span>🛡️</span>
                          <span>Security: ${method.security}/10</span>
                        </span>
                      </div>
                    </div>
                  `,
                )}
              </div>

              <p class="form-footer">By Signing in you will agree to our privacy policy</p>
            </div>
            `
            }
          </div>

          <div class="bottom-bar">
            <div class="brand">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.2 0H0V3.2H3.2V0Z" fill="#F4712F" />
                <path
                  d="M9.6 0.16037C9.10736 0.0601906 8.60639 0.00649803 8.1037 0H5.2V3.2H8.04445C8.9938 3.2 9.92183 3.48151 10.7112 4.00895C11.5005 4.53638 12.1158 5.28603 12.4791 6.16312C12.8424 7.04021 12.9374 8.00532 12.7522 8.93643C12.567 9.86754 12.1098 10.7228 11.4386 11.3941C10.7673 12.0654 9.91199 12.5226 8.98088 12.7078C8.04977 12.893 7.08465 12.7979 6.20756 12.4346C5.33048 12.0713 4.58082 11.4561 4.05339 10.6667C3.52596 9.87738 3.24445 8.94935 3.24445 8V5.2H0.0444446V8C0.0440559 8.55252 0.100777 9.10359 0.213704 9.64444C0.965186 13.2415 4.13259 15.9511 7.94074 16H8.1037C12.4741 15.9444 16 12.3841 16 8C16 4.12963 13.2515 0.901482 9.6 0.16037Z"
                  fill="#F4712F"
                />
                <path
                  d="M7.58458 10.7921C7.14524 10.7265 6.72757 10.5582 6.36556 10.3007C5.99807 10.0401 5.69842 9.6952 5.49176 9.29488C5.28509 8.89456 5.17742 8.45052 5.17778 8V5.17852H8C8.44421 5.17835 8.88219 5.28304 9.2783 5.48407C9.67442 5.68509 10.0175 5.97679 10.2796 6.33542C10.5417 6.69405 10.7155 7.10949 10.7867 7.54794C10.858 7.98639 10.8248 8.43548 10.6897 8.85866C10.5547 9.28185 10.3217 9.66718 10.0096 9.98332C9.69759 10.2995 9.31532 10.5375 8.89393 10.678C8.47254 10.8185 8.02392 10.8576 7.58458 10.7921Z"
                  fill="#F4712F"
                />
              </svg>

              <span class="brand-name">Bright ID</span>
            </div>
            <a href="/interface/privacy-policy" class="privacy"
              >Privacy Policy</a
            >
          </div>
        </div>
      </div>
    `;
  }
}
