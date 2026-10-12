import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('a-dialog')
export class DialogElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare open: boolean;
  @property() declare label: string;

  @state() declare private _animatingOut: boolean;
  private _hideTimer?: ReturnType<typeof setTimeout>;
  private _previousFocus?: HTMLElement;

  constructor() {
    super();
    this.open = false;
    this.label = 'Dialog';
    this._animatingOut = false;
  }

  static styles = css`
    :host {
      display: contents;
    }
    .wrapper {
      position: fixed;
      inset: 0;
      margin: auto;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--foreground);
      max-width: calc(100vw - 2rem);
      max-height: calc(100dvh - 2rem);
      overflow: visible;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s;
    }
    .wrapper::backdrop {
      background: rgb(0 0 0 / 0.5);
      backdrop-filter: blur(4px);
    }
    .close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 0;
      border-radius: var(--radius, 12px);
      background: var(--muted, #eee);
      color: var(--foreground, #111);
      font: inherit;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .close:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }
    .wrapper.visible {
      opacity: 1;
      pointer-events: auto;
    }
    .content {
      background: var(--background, white);
      border-radius: var(--radius, 12px);
      border: 1px solid var(--border, #ddd);
      box-sizing: border-box;
      padding: 3.5rem 1.25rem 1.25rem;
      max-width: calc(100vw - 2rem);
      max-height: calc(100dvh - 2rem);
      overflow-wrap: anywhere;
      overscroll-behavior: contain;
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

      <dialog
        aria-label=${this.label}
        @cancel=${this._onCancel}
        class="wrapper ${this.open ? 'visible' : ''}"
        @click=${this._onBackdropClick}
      >
        <div class="content" part="content">
          <slot name="content"></slot>
        </div>
        <button
          class="close"
          type="button"
          aria-label="Close dialog"
          @click=${() => this.hide()}
        >
          ×
        </button>
      </dialog>
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
      this.shadowRoot?.querySelector('dialog')?.close();
      if (this._previousFocus?.isConnected)
        this._previousFocus.focus({ preventScroll: true });

      this.dispatchEvent(
        new CustomEvent('after-hide', { bubbles: true, composed: true }),
      );
    }, 220);
  }

  private _onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.hide();
  }

  protected updated() {
    const dialog = this.shadowRoot?.querySelector('dialog');
    if (!dialog) return;
    if (this.open && !dialog.open && this.isConnected) {
      let focused = document.activeElement;
      while (focused?.shadowRoot?.activeElement)
        focused = focused.shadowRoot.activeElement;
      this._previousFocus =
        focused instanceof HTMLElement ? focused : undefined;
      dialog.showModal();
    } else if (!this.open && !this._animatingOut && dialog.open) dialog.close();
  }

  disconnectedCallback() {
    clearTimeout(this._hideTimer);
    this._hideTimer = undefined;
    this._animatingOut = false;
    this.shadowRoot?.querySelector('dialog')?.close();
    super.disconnectedCallback();
  }

  private _onCancel = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'a-dialog': DialogElement;
  }
}
