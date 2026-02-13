import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("a-container")
export class ContainerElement extends LitElement {
  static styles?: CSSResultGroup = css`
    section {
      width: 100%;
      max-width: 1920px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: 640px) {
      section {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      section {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }
  `

  protected render(): unknown {
    return html`
      <section>
        <slot></slot>
      </section>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-container": ContainerElement
  }
}
