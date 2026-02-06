import appleIcon from '@/assets/icons/apple.svg'
import brightIDIcon from '@/assets/icons/brightid.svg'
import EmailIcon from '@/assets/icons/email.svg'
import externalLinkIcon from '@/assets/icons/external-link.svg'
import googleIcon from '@/assets/icons/google.svg'
import spinnerIcon from '@/assets/icons/spinner.svg'
import WalletIcon from '@/assets/icons/wallet.svg'
import { auth } from '@/lib/firebase'
import { pushRouter } from '@/router'
import { inputText, isLoginLoading } from '@/states/login'
import {
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userPhoneNumber,
  userProfilePicture
} from '@/states/user'
import { clientAPI } from '@/utils/apis'
import { wagmiConfig } from '@/utils/wallet'
import { SignalWatcher } from '@lit-labs/signals'
import { Connector, signMessage } from '@wagmi/core'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { Address } from 'viem'

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const appleSignInOptions = {
  clientID: 'org.brightid.get-verified',
  redirectUri: 'https://aura-get-verified.vercel.app/sign-in-with-apple',
  state: generateUUID(),
  responseMode: 'form_post',
  scope: 'name email'
} as const

declare const AppleID: any

export const signingMessage =
  'Account Responsibility Notice\nYou are using Aura verified. By signing this message, you confirm ownership of your account. You are responsible for protecting your account and private keys. Keep them secure and do not share them with anyone.'

interface AuthMethod {
  id: string
  name: string
  icon: string
  setupTime: string
  security: number
  description: string
  color: string
  callback?: CallableFunction
}

@customElement('home-page')
export class LoginPage extends SignalWatcher(LitElement) {
  @property({
    type: Boolean
  })
  withoutTitle: boolean = false

  constructor() {
    super()
    try {
      AppleID.auth.init({
        clientId: appleSignInOptions.clientID,
        scope: appleSignInOptions.scope,
        redirectURI: appleSignInOptions.redirectUri,
        state: appleSignInOptions.state,
        usePopup: true
      })
    } catch (e) {
      console.warn('Error in setting up apple auth init', e)
    }

    if (userBrightId.get()) {
      pushRouter('/home')
    }
  }

  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .space-y-3 {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .space-y-2 {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
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
      gap: 0.75rem;
      margin-left: 1rem;
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
      margin-top: 3rem;
      max-width: 28rem;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo {
      width: 4.5rem;
      height: 4.5rem;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 0;
      flex: 1;
    }

    h1.title {
      margin: 1.5rem 0 0;
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
    }

    .info-text {
      margin: 1rem 0 1.5rem;
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
    }

    .desc-btn {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: none;
      font-weight: 600;
      color: #60a5fa;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .desc-btn:hover {
      color: #3b82f6;
    }

    .desc-btn span {
      margin-right: 0.5rem;
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

    .email-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }

    .email-icon {
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .email-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.75rem 1rem 0.75rem 3rem;
      background: #1f2937;
      border: 1px solid #4b5563;
      border-radius: 0.5rem;
      color: #ffffff;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .email-input:focus {
      border-color: #60a5fa;
      outline: none;
    }

    .email-input::placeholder {
      color: #6b7280;
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

  private onInputChange(e: Event) {
    const target = e.target as HTMLInputElement

    inputText.set(target.value)
  }

  private async createBrightId(email: string) {
    const res = await clientAPI.POST('/login', {
      body: {
        email,
        integration: 'email'
      }
    })

    if (res.response.status === 200 && res.data) {
      userEmail.set(email)

      const { id } = res.data

      userBrightId.set(id)
      return id
    }

    throw new Error('Failed to create BrightID' + res.error)
  }

  private async onSubmit() {
    isLoginLoading.set(true)
    const email = inputText.get()
    try {
      const res = await this.createBrightId(email)

      if (res && !this.withoutTitle) {
        pushRouter('/home')
      }
    } catch (e) {
      console.error(e)
    } finally {
      isLoginLoading.set(false)
    }
  }

  private async signInWithGoogle() {
    isLoginLoading.set(true)
    try {
      const provider = new GoogleAuthProvider()
      const res = await signInWithPopup(auth, provider)

      if (!res.user) {
        isLoginLoading.set(false)
        return
      }

      userEmail.set(res.user.email!)

      const id = await this.createBrightId(userEmail.get())

      const [firstName, lastName] = res.user.displayName?.split(' ') ?? []

      userFirstName.set(firstName ?? 'Unknown')
      userLastName.set(lastName ?? '')
      userProfilePicture.set(res.user.photoURL ?? '')
      userPhoneNumber.set(res.user.phoneNumber ?? '')

      if (!this.withoutTitle) pushRouter('/home')
    } catch (error) {
      console.error('Error signing in with Google:', error)
      isLoginLoading.set(false)
    }
  }

  private async signInWithBrightID() {
    if (!this.withoutTitle) {
      pushRouter('/brightid')
      return
    }

    this.dispatchEvent(new CustomEvent('onBrightLogin', { bubbles: true, composed: true }))
  }

  private async signInWithApple() {
    isLoginLoading.set(true)
    try {
      const data = await AppleID.auth.signIn()

      if (!data.authorization) {
        throw new Error('Authorization data is missing')
      }

      const email = data.authorization.user?.email
      const firstName = data.authorization.user?.name?.firstName
      const lastName = data.authorization.user?.name?.lastName

      if (!email) {
        throw new Error('Email is required for registration')
      }

      userEmail.set(email)
      const id = await this.createBrightId(email)

      userBrightId.set(id)
      if (firstName) userFirstName.set(firstName)
      if (lastName) userLastName.set(lastName)
      userProfilePicture.set('')
      userPhoneNumber.set('')

      pushRouter('/home')
    } catch (error) {
      console.error('Error signing in with Apple:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    } finally {
      isLoginLoading.set(false)
    }
  }

  private async requestEthereumSignature(address: Address, connector: Connector) {
    const now = new Date()

    const formattedDate = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: 'UTC'
    })

    const message = `Wallet: ${address}\nDate: ${formattedDate}\nConfirmation: ${signingMessage}`

    const hashResult = await signMessage(wagmiConfig, {
      message,
      account: address,
      connector
    })

    const res = await clientAPI.POST('/login-with-ethereum', {
      body: {
        hashed: hashResult,
        message
      }
    })

    if (!res.data) return

    const data = res.data as { id: string }

    userBrightId.set(data.id)
  }

  private async signInWithEthereum() {
    isLoginLoading.set(true)

    try {
      const connector = wagmiConfig.connectors[0]

      const res = await connector?.connect({
        chainId: 1
      })

      if (!res?.accounts[0]) return

      await this.requestEthereumSignature(res.accounts[0], connector!)

      pushRouter('/complete-profile')
    } catch (e) {
      console.log('Error connecting to wallet:', e)
    } finally {
      isLoginLoading.set(false)
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
      callback: this.signInWithGoogle.bind(this)
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: appleIcon,
      setupTime: '45s',
      security: 3,
      description: 'Sign in with Apple ID',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      callback: this.signInWithApple.bind(this)
    },
    {
      id: 'ethereum',
      name: 'Ethereum Wallet',
      icon: WalletIcon,
      setupTime: '2m',
      security: 4,
      description: 'Connect your crypto wallet',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      callback: () => this.signInWithEthereum()
    },
    {
      id: 'brightid',
      name: 'BrightID',
      icon: brightIDIcon,
      setupTime: '3m',
      security: 10,
      description: 'Decentralized identity verification',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      callback: this.signInWithBrightID
    }
  ]

  render() {
    if (this.withoutTitle) {
      return html` <div class="">
        ${isLoginLoading.get()
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
              <div class="email-wrapper">
                <div class="email-icon">
                  <img width="25" height="25" src="${EmailIcon}" alt="email" />
                </div>
                <input
                  .value="${inputText.get()}"
                  @input=${this.onInputChange}
                  type="email"
                  placeholder="Enter your email"
                  class="email-input"
                />
              </div>

              <div class="btn-wrapper">
                <button
                  @click=${this.onSubmit}
                  .disabled=${isLoginLoading.get()}
                  class="btn btn-email"
                >
                  Sign in with Email
                </button>
                <div class="btn-info">
                  <span class="badge badge-mini security-3 opacity-50">
                    <span class="icon">🛡️</span>
                    <span>3/10</span>
                  </span>
                  <span class="badge badge-mini">
                    <span class="icon">🕒</span>
                    <span>Setup time: +1m</span>
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
                        <button class="button mini-button" @click=${() => method.callback?.()}>
                          <div class="">
                            <img width="20" height="20" src="${method.icon}" alt="${method.name}" />
                          </div>
                        </button>
                        <div class="badge-container mini">
                          <div class="badge security-${method.security}">
                            <span class="icon">🛡️</span>
                            <span>${method.security}/10</span>
                          </div>
                        </div>
                      </div>
                    `
                  )}
                </div>
              </div>
            `}
      </div>`
    }

    return html`
      <div class="wrapper">
        <img src="/favicon.png" class="logo" alt="Aura" />

        <div class="container">
          <h1 class="title">Aura Verified</h1>
          <p class="info-text">Decentralized verification platform</p>

          <a href="https://brightid.gitbook.io/aura" target="_blank" class="desc-btn">
            <span>What is Aura?</span>
            <img src=${externalLinkIcon} alt="Aura" />
          </a>

          <div class="form-container">
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
              <div class="email-wrapper">
                <div class="email-icon">
                  <img width="20" height="20" src="${EmailIcon}" alt="email" />
                </div>
                <input
                  .value="${inputText.get()}"
                  @input=${this.onInputChange}
                  type="email"
                  placeholder="Enter your email"
                  class="email-input"
                />
              </div>

              <div class="btn-wrapper">
                <button @click=${
                  this.onSubmit
                } .disabled=${isLoginLoading.get()} class="btn btn-email">
                  Sign in with Email
                </button>
                <div class="btn-info">
                  <span>Security: Medium</span>
                  <span>Setup time: 1 min</span>
                </div>
              </div>

              <div class="divider"></div>

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

                    <div class="badge-container">
                      <div class="badge" style="color: ${method.color}">
                        <span class="icon">🕒</span>
                        <span>Setup time: + ${method.setupTime}</span>
                      </div>
                      <div class="badge security-${method.security}">
                        <span class="icon">🛡️</span>
                        <span>Security: ${method.security}/10</span>
                      </div>
                    </div>
                  </div>
                `
              )}
                    </div>

              <p class="form-footer">By Signing in you will agree to our privacy policy</p>
            </div>
            `}
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
            <a href="/privacy-policy" class="privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    `
  }
}
