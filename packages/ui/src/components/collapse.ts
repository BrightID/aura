import { LitElement, css, html } from "lit"
import { customElement, property, state } from "lit/decorators.js"

@customElement("a-collapse")
export class CollapseElement extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false
  @property() label = ""
  @property({ type: Boolean }) disabled = false

  @state() private _contentHeight = 0

  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--border, #ddd);
      border-radius: var(--radius, 0.75rem);
      overflow: hidden;
      --collapse-duration: 0.25s;
      --collapse-easing: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      padding: 1rem 1.25rem;
      background: none;
      border: none;
      color: var(--foreground);
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      outline: none;
      transition: background var(--collapse-duration) ease;
      -webkit-tap-highlight-color: transparent;
    }

    .trigger:hover:not(:disabled) {
      background: color-mix(in oklch, var(--muted) 60%, transparent);
    }

    .trigger:focus-visible {
      background: color-mix(in oklch, var(--muted) 60%, transparent);
      box-shadow: inset 0 0 0 2px var(--primary);
    }

    .trigger:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .chevron {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
      transition: transform var(--collapse-duration) var(--collapse-easing);
      color: var(--muted-foreground);
    }

    :host([open]) .chevron {
      transform: rotate(180deg);
    }

    .body {
      overflow: hidden;
      height: 0;
      transition: height var(--collapse-duration) var(--collapse-easing);
    }

    :host([open]) .body {
      height: var(--collapse-content-height, auto);
    }

    .inner {
      padding: 0 1.25rem 1.25rem;
    }
  `

  private _resizeObserver: ResizeObserver | null = null

  connectedCallback() {
    super.connectedCallback()
    this._resizeObserver = new ResizeObserver(() => this._measureContent())
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect()
    super.disconnectedCallback()
  }

  protected firstUpdated() {
    const inner = this.shadowRoot?.querySelector(".inner") as HTMLElement | null
    if (inner) this._resizeObserver?.observe(inner)
    this._measureContent()
  }

  private _measureContent() {
    const inner = this.shadowRoot?.querySelector(".inner") as HTMLElement | null
    if (!inner) return
    this._contentHeight = inner.scrollHeight
    this.style.setProperty("--collapse-content-height", `${this._contentHeight}px`)
  }

  private _toggle() {
    if (this.disabled) return
    this.open = !this.open
    this.dispatchEvent(
      new CustomEvent("open-change", {
        bubbles: true,
        composed: true,
        detail: { open: this.open },
      }),
    )
  }

  protected render() {
    return html`
      <button
        class="trigger"
        ?disabled=${this.disabled}
        aria-expanded=${this.open}
        @click=${this._toggle}
      >
        <slot name="trigger">
          <span>${this.label}</span>
        </slot>
        <svg
          class="chevron"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div class="body" role="region" aria-hidden=${!this.open}>
        <div class="inner">
          <slot></slot>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-collapse": CollapseElement
  }
}
