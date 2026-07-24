import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-alert")
export class AlertElement extends LitElement {
  @property({ reflect: true }) declare variant: "default" | "destructive"

  constructor() {
    super()
    this.variant = "default"
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .alert {
      position: relative;
      display: grid;
      grid-template-columns: 0 1fr;
      row-gap: 0.125rem;
      align-items: start;

      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--card);
      color: var(--card-foreground);
      font-size: 0.875rem;
      line-height: 1.25rem;
      box-sizing: border-box;
    }

    /* When an icon is slotted, open the first column and gap. */
    :host([has-icon]) .alert {
      grid-template-columns: 1rem 1fr;
      column-gap: 0.75rem;
    }

    :host([variant="destructive"]) .alert {
      color: var(--destructive);
      border-color: color-mix(in oklch, var(--destructive) 40%, var(--border));
    }

    .icon {
      grid-column: 1;
      grid-row: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1rem;
    }

    ::slotted([slot="icon"]) {
      width: 1rem;
      height: 1rem;
      color: currentColor;
    }

    .title {
      grid-column: 2;
      min-height: 1rem;
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1.4;
    }

    .body {
      grid-column: 2;
      display: grid;
      justify-items: start;
      gap: 0.25rem;
      color: var(--muted-foreground);
    }

    :host([variant="destructive"]) .body {
      color: color-mix(in oklch, var(--destructive) 90%, transparent);
    }
  `

  private _onIconSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement
    this.toggleAttribute("has-icon", slot.assignedElements().length > 0)
  }

  protected render() {
    return html`
      <div class="alert" role="alert">
        <span class="icon">
          <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
        </span>
        <div class="title"><slot name="title"></slot></div>
        <div class="body"><slot></slot></div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-alert": AlertElement
  }
}
