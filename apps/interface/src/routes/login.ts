import brightIDIcon from '@/assets/icons/brightid.svg'
import LockIcon from '@/assets/icons/lock.svg'
import spinnerIcon from '@/assets/icons/spinner.svg'
import { pushRouter } from '@/router'
import { isLoginLoading } from '@/states/login'
import { registerWithPasskey } from '@aura/sdk/auth/passkeys'
import { SignalWatcher } from '@lit-labs/signals'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'

import '@/components/landing/footer-section'
import '@/components/landing/hero-section'

interface AuthMethod {
  id: string
  name: string
  icon: string
  setupTime: string
  security: number
  description: string
  color?: string
  callback?: CallableFunction
}

@customElement('login-page')
export class LoginPageElement extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .space-y-3 {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .space-y-2 {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .button {
      width: 100%;
      height: 3.75rem;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      border-radius: 0.5rem;
      padding: 0 1.25rem;
      background: linear-gradient(145deg, #2a2a2a05, #1e1e1e6c);
      border: 1px solid #3a3a3a;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .mini-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
    }

    .button:hover {
      background: linear-gradient(145deg, #39383d, #1a0b35);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .button:active {
      transform: translateY(0);
      box-shadow: none;
    }

    .flex-container {
      text-align: left;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .flex-1 {
      flex: 1;
    }

    .font-medium {
      font-weight: 600;
    }

    .text-xs {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .text-muted-foreground {
      color: #9ca3af;
    }

    .badge-container {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .mini {
      margin-left: 0 !important;
      gap: 0.5rem;
      justify-content: center;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #454545;
    }

    .mini .badge,
    .badge-mini {
      padding: 0.2rem;
    }

    .opacity-50 {
      opacity: 0.5;
    }

    .security-0,
    .security-1,
    .security-2,
    .security-3 {
      background-color: #3d1c1c;
      color: #f87171;
      border-color: #b91c1c;
    }

    .security-4,
    .security-5,
    .security-6 {
      background-color: #3d3b1c;
      color: #facc15;
      border-color: #ca8a04;
    }

    .security-7,
    .security-8,
    .security-9,
    .security-10 {
      background-color: #1c3d2e;
      color: #34d399;
      border-color: #059669;
    }

    .icon {
      width: 1rem;
      height: 1rem;
    }

    .wrapper {
      max-width: 28rem;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .form-container {
      margin: 2rem 0;
      position: relative;
      border-radius: 1rem;
      border: 1px solid #4b5563;
      background: rgba(255, 255, 255, 0.08);
      width: 24rem;
      max-width: 75vw;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .lamp-light {
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      width: 1px;
      height: 1px;
      border-radius: 50%;
      box-shadow: 0 0 300px 100px rgba(253, 224, 255, 0.15);
    }

    h2.form-title {
      margin: 0;
      color: #e5e7eb;
      font-size: 1.875rem;
      font-weight: 600;
      text-align: center;
    }

    .form-desc {
      margin: 0.75rem 0 1.25rem;
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-email {
      background: #2563eb;
      color: #ffffff;
      border: none;
    }

    .btn-email:hover {
      background: #1d4ed8;
    }

    .divider {
      height: 1px;
      background: #4b5563;
      margin: 1.5rem 0;
    }

    .mini-divider {
      margin: 0.75rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #6b7280;
    }

    .btn-google {
      background: #ffffff;
      color: #111827;
      border: 1px solid #d1d5db;
    }

    .btn-google:hover {
      background: #f3f4f6;
    }

    .btn-apple {
      background: #000000;
      color: #ffffff;
      border: 1px solid #4b5563;
    }

    .btn-apple:hover {
      background: #1f1f1f;
    }

    .btn-brightid {
      background: #1e40af;
      color: #ffffff;
      border: 1px solid #3b82f6;
    }

    .btn-brightid:hover {
      background: #1e3a8a;
    }

    .btn-icon {
      margin-right: 0.75rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .form-footer {
      color: #9ca3af;
      font-size: 0.75rem;
      text-align: center;
      margin-top: 1rem;
    }

    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      margin-top: 2rem;
      gap: 2rem;
    }

    .brand {
      display: flex;
      align-items: center;
    }

    .brand-icon {
      margin-right: 0.5rem;
      height: 2rem;
      width: 2rem;
      fill: #f97316;
    }

    .brand-name {
      font-weight: 700;
      color: #ffffff;
      font-size: 1rem;
      margin-left: 0.5rem;
    }

    .privacy {
      color: #60a5fa;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .privacy:hover {
      text-decoration: underline;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-wrapper {
      height: 24rem;
      display: grid;
      place-items: center;
    }

    .loading-wrapper h2 {
      margin: 0;
      color: #e5e7eb;
      font-size: 1.5rem;
    }

    .loading-wrapper img {
      margin-top: 1.5rem;
      animation: spin 1s linear infinite;
    }

    .mini-integrations {
      display: flex;
      gap: 0.5rem;
    }

    .mini-integrations button {
      justify-content: center;
      height: 3rem;
      padding: 0;
    }

    .mini-integrations button .btn-icon {
      margin: 0;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .integration-info {
      display: flex;
      flex-direction: column;
      font-size: 0.875rem;
      color: #9ca3af;
      margin-left: 0.75rem;
    }

    .mini-integration-wrapper {
      position: relative;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      flex: 1;
    }

    .mini-info {
      position: absolute;
      bottom: -0.875rem;
      font-size: 0.75rem;
      color: #9ca3af;
      white-space: nowrap;
    }

    .btn-wrapper {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.5rem;
    }

    .btn-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.5rem;
    }

    .green {
      color: #34d399;
    }

    .yellow {
      color: #f4d03f;
    }

    .orange {
      color: #f97316;
    }
  `
  authMethods: AuthMethod[] = [
    {
      id: 'passkey',
      name: 'Passkey',
      icon: LockIcon,
      setupTime: '10s',
      security: 10,
      description: 'Sign in with Passkeys',
      callback: this.signWithPasskey.bind(this)
    },
    {
      id: 'brightid',
      name: 'BrightID',
      icon: brightIDIcon,
      setupTime: '3m',
      security: 10,
      description: 'Decentralized identity verification',
      callback: this.signWithBrightID
    }
  ]

  protected render() {
    return html`
      <div class="wrapper">
        <hero-section></hero-section>

        <div class="container">
          <a-card class="form-container">
            <div class="lamp-light"></div>

            ${isLoginLoading.get()
              ? html`
                  <div class="loading-wrapper">
                    <div>
                      <h2>Signing Up</h2>
                      <img width="25" height="25" src="${spinnerIcon}" alt="spinner" />
                    </div>
                  </div>
                `
              : html`
              <h2 class="form-title">Sign In</h2>
              <p class="form-desc">Use one of these integrations to login</p>

                  <div class="space-y-3">
              ${map(
                this.authMethods,
                (method) => html`
                  <div class="space-y-2">
                    <button class="button" @click=${() => method.callback?.()}>
                      <div class="flex-container">
                        <img width="20" height="20" src="${method.icon}" alt="${method.name}" />
                        <div class="flex-1">
                          <div class="font-medium">${method.name}</div>
                          <div class="text-xs text-muted-foreground">${method.description}</div>
                        </div>
                      </div>
                    </button>
                  </div>
                `
              )}
                    </div>

              <p class="form-footer">By Signing in you will agree to our privacy policy</p>
            </div>
            `}
          </a-card>
        </div>

        <footer-section></footer-section>
      </div>
    `
  }

  protected signWithBrightID() {
    pushRouter('/brightid')
  }

  protected async signWithPasskey() {
    isLoginLoading.set(true)

    try {
      const response = await registerWithPasskey({ mode: 'cached' })
      console.log(response)
    } finally {
      isLoginLoading.set(false)
    }
  }
}
