import { LitElement, css, html } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-text")
export class TextElement extends LitElement {
  @property({ type: String })
  variant: "title" | "lead" | "body" | "small" | "muted" = "body"

  static styles = css`
    :host {
      display: block;
      color: var(--foreground);
    }

    :host([variant="title"]) {
      font-size: 2.25rem;
      line-height: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    :host([variant="lead"]) {
      font-size: 1.25rem;
      line-height: 1.75rem;
      color: var(--muted-foreground);
    }

    :host([variant="body"]) {
      font-size: 1rem;
      line-height: 1.5rem;
    }

    :host([variant="small"]) {
      font-size: 0.875rem;
      line-height: 1.375rem;
    }

    :host([variant="muted"]) {
      font-size: 0.875rem;
      line-height: 1.375rem;
      color: var(--muted-foreground);
    }
  `

  render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-text": TextElement
  }
}
