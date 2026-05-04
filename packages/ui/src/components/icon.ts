import { LitElement, css, html, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

const defaultIconResolver = (name: string): string =>
  `https://unpkg.com/lucide-static@latest/icons/${name}.svg`

@customElement("a-icon")
export class IconElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      line-height: 0;
      color: currentColor;
      vertical-align: -0.125em;
    }

    .mask {
      display: inline-block;
      width: 1em;
      height: 1em;
      background-color: currentColor;
      -webkit-mask: var(--icon-url) no-repeat center / contain;
      mask: var(--icon-url) no-repeat center / contain;
    }

    :host([size="sm"]) {
      font-size: 1rem;
    }
    :host([size="md"]) {
      font-size: 1.5rem;
    }
    :host([size="lg"]) {
      font-size: 2rem;
    }
  `

  @property({ reflect: true }) name?: string
  @property() src?: string
  @property() label = ""

  @property({ reflect: true }) library = "default"
  @property({ reflect: true }) size: "sm" | "md" | "lg" | "" = ""

  private get effectiveSrc(): string | null {
    if (this.src) return this.src
    if (this.name) return defaultIconResolver(this.name)
    return null
  }

  connectedCallback() {
    super.connectedCallback()
    this.updateAccessibility()
  }

  updated(changedProperties: Map<PropertyKey, unknown>) {
    if (
      changedProperties.has("label") ||
      changedProperties.has("name") ||
      changedProperties.has("src")
    ) {
      this.updateAccessibility()
    }
  }

  private updateAccessibility() {
    if (this.label?.trim()) {
      this.setAttribute("role", "img")
      this.setAttribute("aria-label", this.label)
      this.removeAttribute("aria-hidden")
    } else {
      this.removeAttribute("role")
      this.removeAttribute("aria-label")
      this.setAttribute("aria-hidden", "true")
    }
  }

  render() {
    const url = this.effectiveSrc
    if (!url) return html`<span aria-hidden="true"></span>`
    return html`<span
      class="mask"
      style=${`--icon-url: url("${url}")`}
    ></span>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-icon": IconElement
  }
}
