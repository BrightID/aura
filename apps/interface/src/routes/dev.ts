import { LightElement } from '@aura/widgets/light-element';
import '@/components/project-verification';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './dev.css';

@customElement('verification-project')
export class EmbeddedVerificationPageElement extends SignalWatcher(
  LightElement,
) {
  @state() private isModalOpen = false;
  protected iframeElement: null | HTMLIFrameElement = null;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('message', this.onWindowMessage);
  }

  override disconnectedCallback(): void {
    window.removeEventListener('message', this.onWindowMessage);
  }

  onIframeLoad() {
    this.iframeElement = this.renderRoot.querySelector('#iframe');
  }

  private openModal() {
    this.isModalOpen = true;
  }

  // private closeModal() {
  //   this.isModalOpen = false
  // }

  protected onWindowMessage(e: MessageEvent<any>) {
    const message = e.data;
    try {
      const data = JSON.parse(message);
      if (data.app !== 'aura') return;
      switch (data.type) {
        case 'app-ready':
          this.dispatchEvent(new CustomEvent('on-ready'));
          return;
        case 'verification-success':
          this.dispatchEvent(new CustomEvent('on-verification-success'));
          return;
      }
    } catch {
      return;
    }
  }

  protected render() {
    return html`
      <div class="container">
        <a href="/interface/login">Back</a>

        <!--<a-dialog
          .open=${this.isModalOpen}
          @open-change=${(e: CustomEvent<{ open: boolean }>) => {
          this.isModalOpen = e.detail.open;
        }}
        >
          <button slot="trigger" @click=${this.openModal}>Get Verified</button>-->

        <!--<div slot="content">-->
        <div class="margin-top"></div>
        <iframe
          id="iframe"
          @load=${this.onIframeLoad}
          height="600"
          src="/embed/projects/9"
        ></iframe>
        <!--</div>
        </a-dialog>-->
      </div>
    `;
  }
}
