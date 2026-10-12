import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('a-hover-card')
export class HoverCardElement extends LitElement {
  @property({ type: Number }) declare openDelay: number; // ms
  @property({ type: Number }) declare closeDelay: number; // ms
  @property({ reflect: true }) declare side:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';

  @state() declare private _open: boolean;
  private _openTimer?: number;
  private _closeTimer?: number;
  private _resizeObserver = new ResizeObserver(() => this._position());

  constructor() {
    super();
    this.openDelay = 100;
    this.closeDelay = 200;
    this.side = 'bottom';
    this._open = false;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .content-wrapper {
      position: fixed;
      inset: auto;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      width: max-content;
      max-width: calc(100vw - 2rem);
      max-height: calc(100dvh - 2rem);
      overflow: auto;
      overflow-wrap: anywhere;
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
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseleave', this._handleMouseLeave);
    this.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._position);
    window.addEventListener('scroll', this._position, true);
  }

  private _handleMouseEnter() {
    clearTimeout(this._closeTimer);
    clearTimeout(this._openTimer);
    this._openTimer = window.setTimeout(() => {
      this._open = true;
    }, this.openDelay);
  }

  private _handleMouseLeave() {
    clearTimeout(this._openTimer);
    if (this.contains(document.activeElement)) return;
    this._closeTimer = window.setTimeout(() => {
      this._open = false;
    }, this.closeDelay);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._openTimer);
    clearTimeout(this._closeTimer);
    this._resizeObserver.disconnect();
    this.removeEventListener('mouseleave', this._handleMouseLeave);
    this.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._position);
    window.removeEventListener('scroll', this._position, true);
    this.shadowRoot
      ?.querySelector<HTMLElement>('.content-wrapper')
      ?.hidePopover();
  }

  protected updated() {
    const popup =
      this.shadowRoot?.querySelector<HTMLElement>('.content-wrapper');
    if (!popup || !this.isConnected) return;
    this._resizeObserver.observe(popup);
    if (this._open) {
      if (!popup.matches(':popover-open')) popup.showPopover();
      this._position();
    } else if (popup.matches(':popover-open')) popup.hidePopover();
  }

  private _position = () => {
    if (!this._open) return;
    const popup =
      this.shadowRoot?.querySelector<HTMLElement>('.content-wrapper');
    if (!popup) return;
    const trigger = this.getBoundingClientRect();
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const gap = 8;
    let left = trigger.left + (trigger.width - width) / 2;
    let top = trigger.bottom + gap;
    if (
      this.side === 'top' ||
      (this.side === 'bottom' && top + height > window.innerHeight - 16)
    )
      top = trigger.top - height - gap;
    if (this.side === 'left' || this.side === 'right') {
      left =
        this.side === 'left' ? trigger.left - width - gap : trigger.right + gap;
      top = trigger.top + (trigger.height - height) / 2;
    }
    popup.style.left = `${Math.max(16, Math.min(left, window.innerWidth - width - 16))}px`;
    popup.style.top = `${Math.max(16, Math.min(top, window.innerHeight - height - 16))}px`;
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this._open) return;
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this._openTimer);
    clearTimeout(this._closeTimer);
    this._open = false;
  };

  private _onTriggerClick(event: Event) {
    event.stopPropagation();
    clearTimeout(this._openTimer);
    clearTimeout(this._closeTimer);
    this._open = !this._open;
  }

  render() {
    return html`
      <div
        class="trigger-wrapper"
        @focusin=${this._handleMouseEnter}
        @focusout=${this._handleMouseLeave}
        @mouseenter=${this._handleMouseEnter}
        @click=${this._onTriggerClick}
      >
        <slot name="trigger"></slot>
      </div>

      <div
        class="content-wrapper"
        popover="manual"
        @mouseenter=${this._handleMouseEnter}
        @mouseleave=${this._handleMouseLeave}
        @focusin=${this._handleMouseEnter}
        @focusout=${this._handleMouseLeave}
        @click=${(event: Event) => event.stopPropagation()}
      >
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

@customElement('a-hover-card-trigger')
export class HoverCardTriggerElement extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      cursor: pointer;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

@customElement('a-hover-card-content')
export class HoverCardContentElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-hover-card': HoverCardElement;
    'a-hover-card-trigger': HoverCardTriggerElement;
    'a-hover-card-content': HoverCardContentElement;
  }
}
