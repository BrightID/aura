import { css, html, LitElement } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-separator")
export class SeparatorElement extends LitElement {
  @property({ reflect: true })
  orientation: "horizontal" | "vertical" = "horizontal"

  static styles = css`
    :host {
      display: block;
      background-color: var(--border);
      flex-shrink: 0;
    }

    :host([orientation="horizontal"]) {
      height: 1px;
      width: 100%;
      margin: 1.5rem 0;
    }

    :host([orientation="vertical"]) {
      width: 1px;
      height: 100%;
      margin: 0 1.5rem;
      align-self: stretch;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    if (!this.hasAttribute("role")) this.setAttribute("role", "separator")
    this._syncAria()
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("orientation")) this._syncAria()
  }

  private _syncAria() {
    this.setAttribute("aria-orientation", this.orientation)
  }

  render() {
    return html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-separator": SeparatorElement
  }
}
