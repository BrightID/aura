import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-label")
export class LabelElement extends LitElement {
  @property() declare for?: string

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      color: var(--foreground);
      user-select: none;
    }

    :host([data-disabled]) label,
    :host([disabled]) label {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `

  render() {
    return html`<label for=${this.for ?? ""}><slot></slot></label>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-label": LabelElement
  }
}
