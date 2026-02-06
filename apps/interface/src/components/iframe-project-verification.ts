import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const productionAuraGetVerifiedURL = 'https://aura-get-verified.vercel.app'

@customElement('iframe-project-verification')
export class IFramePorjectVerification extends LitElement {
  @property({
    type: Number
  })
  height = 525

  @property({
    type: Number
  })
  projectId?: number

  @property({
    type: Number
  })
  level?: number = 1

  @property({
    type: String
  })
  projectName?: string

  @property({
    type: String
  })
  description?: string

  @property({
    type: String
  })
  image?: string

  @property({
    type: String
  })
  foregroundColor = '#fffff'

  protected iframeElement: null | HTMLIFrameElement = null

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
    if (this.projectId) {
      return html`
        <iframe
          id="iframe"
          @load=${this.onIframeLoad}
          .height=${`${this.height}px`}
          .src=${productionAuraGetVerifiedURL + '/embed/projects/' + this.projectId}
        ></iframe>
      `
    }

    return html`
      <iframe
        id="iframe"
        @load=${this.onIframeLoad}
        .height=${`${this.height}px`}
        .src=${productionAuraGetVerifiedURL +
        `/embed/verification?description=${this.description}&image=${this.image}&level=${this.level}&name=${this.projectName}`}
      ></iframe>
    `
  }
}
