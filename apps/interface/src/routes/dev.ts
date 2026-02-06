import timesIcon from '@/assets/icons/times.svg'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import '@/components/project-verification'
import { SignalWatcher } from '@lit-labs/signals'

@customElement('verification-project')
export class EmbeddedVerificationPageElement extends SignalWatcher(LitElement) {
  @state() private isModalOpen = false

  protected iframeElement: null | HTMLIFrameElement = null

  static styles?: CSSResultGroup | undefined = css`
    .container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }
    a {
      color: #bfb3f8;
      font-weight: bold;
      text-decoration: none;
      display: block;
      text-align: left;
    }
    a:hover {
      text-decoration: underline;
    }
    button {
      padding: 10px 20px;
      margin-top: 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #0056b3;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal.open {
      display: flex;
      animation: fadeIn 0.3s ease-in-out;
    }
    .modal-content {
      background: #ffffff14;
      border: 1px solid #2f353d;
      padding: 14px;
      width: 350px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-in-out;
      color: #e0e7ff; /* Light text for modal */
      position: relative;
    }
    .modal-content h2 {
      margin-top: 0;
      color: #e0e7ff;
      font-size: 24px;
    }
    .modal-content p {
      color: #d1d8f5;
      line-height: 1.5;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .close-btn {
      position: absolute;
      left: 10px;
      top: 10px;
      cursor: pointer;
    }

    iframe {
      border: none;
      width: 100%;
    }
  `

  override connectedCallback(): void {
    super.connectedCallback()
    window.addEventListener('message', this.onWindowMessage)
  }

  override disconnectedCallback(): void {
    window.removeEventListener('message', this.onWindowMessage)
  }

  onIframeLoad() {
    this.iframeElement = this.renderRoot.querySelector('#iframe')
  }

  private toggleModal() {
    this.isModalOpen = !this.isModalOpen
  }

  protected onWindowMessage(e: MessageEvent<any>) {
    const message = e.data

    try {
      const data = JSON.parse(message)

      if (data.app !== 'aura-get-verified') return

      switch (data.type) {
        case 'app-ready':
          this.dispatchEvent(new CustomEvent('on-ready'))
          return
        case 'verification-success':
          this.dispatchEvent(new CustomEvent('on-verification-success'))
          return
      }
    } catch {
      return
    }
  }

  protected render() {
    return html`
      <div class="container">
        <a href="/">Back</a>
        <button @click=${this.toggleModal}>Get Verified</button>
        <div class="modal ${this.isModalOpen ? 'open' : ''}">
          <div class="modal-content">
            <div class="close-btn" @click=${this.toggleModal}>
              <img src="${timesIcon}" alt="times" width="24" height="24" />
            </div>

            <iframe
              id="iframe"
              @load=${this.onIframeLoad}
              height="550"
              src="/embed/projects/4"
            ></iframe>
          </div>
        </div>
      </div>
    `
  }
}
