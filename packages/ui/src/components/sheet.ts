import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

@customElement('a-sheet')
export class SheetElement extends LitElement {
  @property({ type: Boolean }) declare open: boolean;
  @property({ reflect: true }) declare side: SheetSide;

  @state() declare private _animatingOut: boolean;
  private _hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.open = false;
    this.side = 'right';
    this._animatingOut = false;
  }

  static styles = css`
    :host {
      display: contents;
    }
    .wrapper {
      position: fixed;
      inset: 0;
      background: #0008;
      backdrop-filter: blur(2px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s ease;
      z-index: 100;
    }
    .wrapper.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .content {
      position: fixed;
      background: var(--card, var(--background, white));
      color: var(--card-foreground, var(--foreground));
      border: 1px solid var(--border, #ddd);
      box-shadow: 0 10px 40px -10px #0007;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: var(--md, 24px);
      box-sizing: border-box;
      overflow: auto;
      transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
    }

    /* Right / Left: full height, edge-pinned vertical panel. */
    :host([side='right']) .content,
    :host([side='left']) .content {
      top: 0;
      bottom: 0;
      height: 100%;
      width: min(24rem, 100vw);
    }
    :host([side='right']) .content {
      right: 0;
      border-right: none;
      transform: translateX(100%);
    }
    :host([side='left']) .content {
      left: 0;
      border-left: none;
      transform: translateX(-100%);
    }

    /* Top / Bottom: full width, edge-pinned horizontal panel. */
    :host([side='top']) .content,
    :host([side='bottom']) .content {
      left: 0;
      right: 0;
      width: 100%;
      height: auto;
      max-height: 90vh;
    }
    :host([side='top']) .content {
      top: 0;
      border-top: none;
      transform: translateY(-100%);
    }
    :host([side='bottom']) .content {
      bottom: 0;
      border-bottom: none;
      transform: translateY(100%);
    }

    /* Slide in when visible. */
    .wrapper.visible .content {
      transform: translate(0, 0);
    }
  `;

  protected render() {
    return html`
      <slot name="trigger" @click=${this._onTriggerClick}></slot>

      <div
        class="wrapper ${this.open ? 'visible' : ''}"
        @click=${this._onBackdropClick}
      >
        <div class="content" role="dialog" aria-modal="true">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }

  private _onTriggerClick(e: Event) {
    e.stopPropagation();
    this.show();
  }

  show() {
    if (this.open && !this._animatingOut) return;
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = undefined;
    }
    this.open = true;
    this._animatingOut = false;

    this.dispatchEvent(
      new CustomEvent('open-change', {
        bubbles: true,
        composed: true,
        detail: { open: true },
      }),
    );
  }

  hide() {
    if (!this.open || this._animatingOut) return;
    this._animatingOut = true;
    this.open = false;

    this.dispatchEvent(
      new CustomEvent('open-change', {
        bubbles: true,
        composed: true,
        detail: { open: false },
      }),
    );

    this._hideTimer = setTimeout(() => {
      this._animatingOut = false;
      this._hideTimer = undefined;

      this.dispatchEvent(
        new CustomEvent('after-hide', { bubbles: true, composed: true }),
      );
    }, 320);
  }

  private _onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.hide();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    super.disconnectedCallback();
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (this.open && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'a-sheet': SheetElement;
  }
}
