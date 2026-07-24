import { type CSSResultGroup, css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-skeleton")
export class SkeletonElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      height: 1rem;
      background: var(--muted);
      border-radius: var(--radius);
      animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      50% {
        opacity: 0.5;
      }
    }
  `

  render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-skeleton": SkeletonElement
  }
}
