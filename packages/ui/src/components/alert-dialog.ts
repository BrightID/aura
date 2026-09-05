import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('a-alert-dialog')
export class AlertDialogElement extends LitElement {
  @property({ type: Boolean }) declare open: boolean;

  @state() declare private _animatingOut: boolean;
  private _hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    this.open = false;
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
      backdrop-filter: blur(4px);
      display: grid;
      place-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s;
      z-index: 100;
    }
    .wrapper.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .content {
      background: var(--popover, var(--card, white));
      color: var(--popover-foreground, var(--card-foreground));
      border-radius: var(--radius, 12px);
      border: 1px solid var(--border, #ddd);
      padding: var(--md, 24px);
      width: 100%;
      max-width: 32rem;
      margin: 0 1rem;
      box-sizing: border-box;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 10px 30px -8px #0006;
      transform: scale(0.8);
      opacity: 0;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .visible .content {
      transform: scale(1);
      opacity: 1;
    }
  `;

  protected render() {
    return html`
      <slot name="trigger" @click=${this._onTriggerClick}></slot>

      <div class="wrapper ${this.open ? 'visible' : ''}">
        <div class="content" role="alertdialog" aria-modal="true">
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
    }, 220);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    super.disconnectedCallback();
  }

  // Alert dialogs stay open on backdrop click — the user must choose an action.
  // Escape still cancels, matching native alertdialog affordances.
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
    'a-alert-dialog': AlertDialogElement;
  }
}
