import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult,
} from "lit"
import { customElement, property, state } from "lit/decorators.js"

const defaultIconResolver = (name: string): string =>
  `https://unpkg.com/lucide-static@latest/icons/${name}.svg`

const iconCache = new Map<string, Promise<SVGSVGElement | null>>()

@customElement("a-icon")
export class IconElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      line-height: 0; /* removes unwanted vertical space */
      color: currentColor; /* inherit text color → fill color */
    }

    svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
      vertical-align: -0.125em; /* better alignment in text */
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

  @property({ reflect: true }) library = "default" // optional – can be used later
  @property({ reflect: true }) size: "sm" | "md" | "lg" | "" = "" // convenience

  @state() private svgContent: TemplateResult | SVGSVGElement | null = null

  connectedCallback() {
    super.connectedCallback()
    this.loadIcon()
    this.updateAccessibility()
  }

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (
      changedProperties.has("name") ||
      changedProperties.has("src") ||
      changedProperties.has("library")
    ) {
      this.loadIcon()
    }
  }

  private get effectiveSrc(): string | null {
    if (this.src) return this.src

    if (this.name) {
      // You can swap this with getIconLibrary(this.library)?.resolver(this.name)
      return defaultIconResolver(this.name)
    }

    return null
  }

  private async loadIcon() {
    const url = this.effectiveSrc
    if (!url) {
      this.svgContent = null
      return
    }

    let promise = iconCache.get(url)

    if (!promise) {
      promise = this.fetchAndParseSvg(url).catch(() => null)
      iconCache.set(url, promise)
    }

    const svg = await promise

    // Only update if URL still matches (avoid race condition)
    if (url === this.effectiveSrc) {
      this.svgContent = svg
    }
  }

  private async fetchAndParseSvg(url: string): Promise<SVGSVGElement | null> {
    try {
      const res = await fetch(url, { mode: "cors" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, "image/svg+xml")

      if (doc.querySelector("parsererror")) {
        console.warn("SVG parse error:", url)
        return null
      }

      const svg = doc.documentElement as unknown as SVGSVGElement
      if (svg.tagName.toLowerCase() !== "svg") return null

      // Clean up attributes we don't want / normalize
      svg.removeAttribute("xmlns:xlink")
      svg.removeAttribute("width")
      svg.removeAttribute("height")
      // preserve viewBox and others

      return svg
    } catch (err) {
      console.warn("Failed to load icon:", url, err)
      return null
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

  updated(changedProperties: Map<PropertyKey, unknown>) {
    if (
      changedProperties.has("label") ||
      changedProperties.has("name") ||
      changedProperties.has("src")
    ) {
      this.updateAccessibility()
    }
  }

  render() {
    if (!this.svgContent) {
      return html`<span aria-hidden="true"><!-- icon failed --></span>`
    }

    if (this.svgContent instanceof SVGSVGElement) {
      // We clone because we might reuse from cache
      const cloned = this.svgContent.cloneNode(true) as SVGSVGElement
      return html`${cloned}`
    }

    // Fallback — shouldn't normally happen in this version
    return this.svgContent
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-icon": IconElement
  }
}
