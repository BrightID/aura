import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-badge")
export class BadgeElement extends LitElement {
  @property({ reflect: true })
  variant:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "accent"
    | "glass" = "default"

  @property({ reflect: true })
  size: "sm" | "md" | "lg" | "xs" = "md"

  @property({ type: Boolean, reflect: true })
  rounded = false

  @property({ type: Boolean })
  removable = false

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35em;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      border-radius: var(--xl2, 0.5rem);
      transition: all 0.13s ease;
      user-select: none;
      vertical-align: middle;
    }

    :host([size="xs"]) {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      min-height: 1rem;
    }

    :host([size="sm"]) {
      font-size: 0.75rem;
      padding: 0.25rem 0.55rem;
      min-height: 1.4rem;
    }

    :host([size="md"]) {
      font-size: 0.875rem;
      padding: 0.35rem 0.75rem;
      min-height: 1.75rem;
    }

    :host([size="lg"]) {
      font-size: 1rem;
      padding: 0.45rem 0.95rem;
      min-height: 2rem;
    }

    :host([rounded]) {
      border-radius: 9999px;
    }

    :host {
      background-color: var(--muted);
      color: var(--muted-foreground);
      border: 1px solid transparent;
    }

    :host([variant="secondary"]) {
      background-color: var(--secondary);
      color: var(--secondary-foreground);
      border-color: transparent;
    }

    :host([variant="destructive"]) {
      background-color: var(--destructive);
      color: var(--destructive-foreground);
      border-color: transparent;
    }

    :host([variant="accent"]) {
      background-color: var(--accent);
      color: var(--accent-foreground);
      border-color: transparent;
    }

    :host([variant="outline"]) {
      background-color: transparent;
      color: var(--foreground);
      border: 1px solid var(--border);
    }

    :host([variant="glass"]) {
      background-color: color-mix(in oklch, var(--background) 35%, transparent);
      backdrop-filter: blur(12px) saturate(1.8);
      -webkit-backdrop-filter: blur(12px) saturate(1.8);
      border: 1px solid color-mix(in oklch, var(--border) 50%, transparent);
      color: var(--foreground);
      box-shadow: 0 1px 5px oklch(0 0 0 / 0.07);
    }

    .remove-btn {
      display: none;
      margin-left: 0.15em;
      margin-right: -0.15em;
      width: 1.1em;
      height: 1.1em;
      border-radius: 999px;
      background: currentColor;
      color: inherit;
      opacity: 0.7;
      cursor: pointer;
      font-size: 0.9em;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border: 0;
      padding: 0;
      transition: opacity 0.15s;
    }

    .remove-btn:hover {
      opacity: 1;
    }

    :host([removable]) .remove-btn {
      display: inline-flex;
    }

    slot {
      display: contents;
    }
  `

  private _handleRemove(e: Event) {
    e.stopPropagation()
    this.dispatchEvent(
      new CustomEvent("remove", {
        bubbles: true,
        composed: true,
        detail: { badge: this },
      }),
    )
  }

  render() {
    return html`
      <slot></slot>

      ${this.removable
        ? html`
            <button
              class="remove-btn"
              aria-label="Remove"
              @click=${this._handleRemove}
            >
              ×
            </button>
          `
        : ""}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-badge": BadgeElement
  }
}
