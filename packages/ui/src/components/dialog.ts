import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('a-dialog')
export class DialogElement extends LitElement {
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
      background: #0003;
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
    // Reopening mid-leave: cancel the pending close so `after-hide` (and the
    // consumer's state cleanup) never fires against a now-open dialog.
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
    // Drop `.visible` now so the fade/scale-out transition actually plays over
    // the next 220ms. Contents stay mounted (consumers keep their state until
    // `after-hide`), so the exit animates the real content, not an empty shell.
    this.open = false;

    this.dispatchEvent(
      new CustomEvent('open-change', {
        bubbles: true,
        composed: true,
        detail: { open: false },
      }),
    );

    // Fire once the exit transition has finished and the dialog is fully
    // transparent — only then may consumers unmount / clear their contents.
    this._hideTimer = setTimeout(() => {
      this._animatingOut = false;
      this._hideTimer = undefined;

      this.dispatchEvent(
        new CustomEvent('after-hide', { bubbles: true, composed: true }),
      );
    }, 220);
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
    'a-dialog': DialogElement;
  }
}
