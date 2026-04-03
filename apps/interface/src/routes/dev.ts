import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@/components/project-verification'
import '@aura/ui/components/dialog'
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
    iframe {
      border: none;
      width: 100%;
    }
    .margin-top {
      margin-top: 24px;
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

  private openModal() {
    this.isModalOpen = true
  }

  // private closeModal() {
  //   this.isModalOpen = false
  // }

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

        <!--<a-dialog
          .open=${this.isModalOpen}
          @open-change=${(e: CustomEvent<{ open: boolean }>) => {
          this.isModalOpen = e.detail.open
        }}
        >
          <button slot="trigger" @click=${this.openModal}>Get Verified</button>-->

        <!--<div slot="content">-->
        <div class="margin-top"></div>
        <iframe
          id="iframe"
          @load=${this.onIframeLoad}
          height="600"
          src="/embed/projects/4"
        ></iframe>
        <!--</div>
        </a-dialog>-->
      </div>
    `
  }
}
