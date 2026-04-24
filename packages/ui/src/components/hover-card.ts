import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property, state } from "lit/decorators.js"

@customElement("a-hover-card")
export class HoverCardElement extends LitElement {
  @property({ type: Number }) openDelay = 100 // ms
  @property({ type: Number }) closeDelay = 200 // ms
  @property({ reflect: true }) side: "top" | "bottom" | "left" | "right" =
    "bottom"

  @state() private _open = false
  private _openTimer?: number
  private _closeTimer?: number

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .content-wrapper {
      position: absolute;
      z-index: 50;
      opacity: 0;
      left: 50%;
      transform: translateX(-50%) translateY(-4px) scale(0.95);
      pointer-events: none;
      transition:
        opacity 0.15s ease,
        transform 0.15s ease;
      will-change: opacity, transform;
    }

    .content-wrapper[data-state="open"] {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0) scale(1);
    }

    .content {
      /* min-width: 20rem; */
      max-width: 24rem;
      background: var(--card);
      color: var(--card-foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
      overflow: hidden;
    }

    /* Positioning – top/bottom center horizontally */
    :host([side="top"]) .content-wrapper {
      bottom: 100%;
      top: auto;
      left: 50%;
      margin-bottom: 0.5rem;
    }
    :host([side="bottom"]) .content-wrapper {
      top: 100%;
      left: 50%;
      margin-top: 0.25rem;
    }

    /* Left/right: center vertically, reset horizontal centering */
    :host([side="left"]) .content-wrapper {
      right: 100%;
      left: auto;
      top: 50%;
      margin-right: 0.5rem;
      transform: translateX(4px) translateY(-50%) scale(0.95);
    }
    :host([side="left"]) .content-wrapper[data-state="open"] {
      transform: translateX(0) translateY(-50%) scale(1);
    }

    :host([side="right"]) .content-wrapper {
      left: 100%;
      top: 50%;
      margin-left: 0.5rem;
      transform: translateX(-4px) translateY(-50%) scale(0.95);
    }
    :host([side="right"]) .content-wrapper[data-state="open"] {
      transform: translateX(0) translateY(-50%) scale(1);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener("mouseleave", this._handleMouseLeave)
  }

  private _handleMouseEnter() {
    clearTimeout(this._closeTimer)
    this._openTimer = window.setTimeout(() => {
      this._open = true
    }, this.openDelay)
  }

  private _handleMouseLeave() {
    clearTimeout(this._openTimer)
    this._closeTimer = window.setTimeout(() => {
      this._open = false
    }, this.closeDelay)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this._openTimer)
    clearTimeout(this._closeTimer)
    this.removeEventListener("mouseleave", this._handleMouseLeave)
  }

  render() {
    return html`
      <div
        class="trigger-wrapper"
        @focusin=${this._handleMouseEnter}
        @focusout=${this._handleMouseLeave}
        @mouseenter=${this._handleMouseEnter}
      >
        <slot name="trigger"></slot>
      </div>

      <div class="content-wrapper" data-state=${this._open ? "open" : "closed"}>
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>
    `
  }
}

@customElement("a-hover-card-trigger")
export class HoverCardTriggerElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      cursor: pointer;
    }
  `

  render() {
    return html`<slot></slot>`
  }
}

@customElement("a-hover-card-content")
export class HoverCardContentElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  `

  render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-hover-card": HoverCardElement
    "a-hover-card-trigger": HoverCardTriggerElement
    "a-hover-card-content": HoverCardContentElement
  }
}
