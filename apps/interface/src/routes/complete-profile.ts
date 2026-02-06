import externalLinkIcon from '@/assets/icons/external-link.svg'
import ProfileIcon from '@/assets/icons/user.svg'
import { pushRouter } from '@/router'
import { userFirstName, userLastName } from '@/states/user'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

const name = signal('')

@customElement('complete-profile')
export class CompleteProfile extends SignalWatcher(LitElement) {
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

    .icon {
      width: 1rem;
      height: 1rem;
    }

    .wrapper {
      margin-top: 3rem;
      max-width: 28rem;
      margin-left: auto;
      margin-right: auto;
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
      margin: 2rem 0 1rem;
      position: relative;
      border-radius: 1rem;
      border: 1px solid #4b5563;
      background: rgba(255, 255, 255, 0.08);
      width: 100%;
      max-width: 24rem;
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

    .name-wrapper {
      position: relative;
      margin-bottom: 40px;
      margin-top: 40px;
    }

    .name-icon {
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      color: #9ca3af;
    }

    .name-input {
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

    .name-input:focus {
      border-color: #60a5fa;
      outline: none;
    }

    .name-input::placeholder {
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

    .btn-name {
      background: #2563eb;
      color: #ffffff;
      border: none;
    }

    .btn-name:hover {
      background: #1d4ed8;
    }

    .btn-skip {
      background: transparent;
      color: #60a5fa;
      border: 1px solid #60a5fa;
    }

    .btn-skip:hover {
      background: #60a5fa;
      color: #ffffff;
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

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
  `

  private onInputChange(e: Event) {
    const target = e.target as HTMLInputElement

    name.set(target.value)
  }

  onSkip() {
    pushRouter('/home')
  }

  onSubmit() {
    const [firstName, lastName] = name.get().split(' ')

    userFirstName.set(firstName ?? '')
    userLastName.set(lastName ?? '')

    pushRouter('/home')
  }

  protected render() {
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
            <h2 class="form-title">Complete your info</h2>
            <div class="name-wrapper">
              <div class="name-icon">
                <img width="25" height="25" src="${ProfileIcon}" alt="profile" />
              </div>
              <input
                .value="${name.get()}"
                @input=${this.onInputChange}
                type="text"
                placeholder="Enter your name"
                class="name-input"
              />
            </div>

            <div class="btn-wrapper">
              <button @click=${this.onSubmit} class="btn btn-name">Continue</button>
              <button @click=${this.onSkip} class="btn btn-skip">Skip</button>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
