import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('a-dialog')
export class DialogElement extends LitElement {
  @property({ type: Boolean }) open = false

  @state() private _animatingOut = false

  static styles = css`
    :host {
      display: contents;
    }
    .wrapper {
      position: fixed;
      inset: 0;
      background: #0003;
      backdrop-filter: blur(4px);
      display: grid;
      place-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s;
    }
    .wrapper.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .content {
      background: var(--background, white);
      border-radius: var(--radius, 12px);
      border: 1px solid var(--border, #ddd);
      padding: var(--md, 24px);
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      transform: scale(0.8);
      opacity: 0;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .visible .content {
      transform: scale(1);
      opacity: 1;
    }
  `

  protected render() {
    return html`
      <slot name="trigger" @click=${this.show}></slot>

      <div
        class="wrapper ${this.open || this._animatingOut ? 'visible' : ''}"
        @click=${this._onBackdropClick}
      >
        <div class="content" @click=${(e: Event) => e.stopPropagation()}>
          <slot name="content"></slot>
        </div>
      </div>
    `
  }

  show() {
    this._animatingOut = false

    this.dispatchEvent(
      new CustomEvent('onChange', { bubbles: true, composed: true, detail: { value: true } })
    )
  }

  hide() {
    this._animatingOut = true

    this.dispatchEvent(
      new CustomEvent('onChange', { bubbles: true, composed: true, detail: { value: false } })
    )

    this._animatingOut = false
  }

  private _onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.hide()
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('keydown', this._onKeyDown)
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown)
    super.disconnectedCallback()
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (this.open && e.key === 'Escape') {
      e.preventDefault()
      this.hide()
    }
  }
}
