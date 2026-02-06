import { type CSSResultGroup, LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../components/dialog'

@customElement('dialog-section')
export class DialogSection extends LitElement {
  static styles?: CSSResultGroup = css``

  @state()
  isOpen = false

  protected render() {
    return html`
      <a-head level="3"> Dialogs Preview </a-head>

      <a-dialog
        @onChange=${(event: CustomEvent) => (this.isOpen = event.detail.value)}
        .open=${this.isOpen}
      >
        <a-button slot="trigger">Open dialog</a-button>

        <div slot="content">
          <a-head>Hello</a-head>
          <a-text>Content goes here</a-text>
          <a-button variant="secondary" @click=${() => (this.isOpen = false)}> Close </a-button>
        </div>
      </a-dialog>
    `
  }
}
