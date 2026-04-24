import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-separator")
export class SeparatorElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 1px;
      background-color: var(--border);
      margin: 1.5rem 0;
    }
  `

  render() {
    return html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-separator": SeparatorElement
  }
}
