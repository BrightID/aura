import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property } from "lit/decorators.js"

@customElement("a-flex")
export class FlexElement extends LitElement {
  @property()
  direction: "col" | "row" = "row"

  @property({ type: Number })
  gap: number = 10

  @property({ type: Boolean })
  wrap: boolean = false

  @property({ reflect: true })
  justify: "start" | "center" | "end" | "between" = "start"

  @property({ reflect: true })
  align: "start" | "end" | "center" = "start"

  static styles?: CSSResultGroup = css`
    div {
      display: flex;
      flex-direction: row;
    }

    div[data-gap="1"] {
      gap: var(--sm);
    }

    div[data-gap="4"] {
      gap: var(--md);
    }

    div[data-direction="col"] {
      flex-direction: column;
    }

    div[data-justify="start"] {
      justify-content: flex-start;
    }

    div[data-justify="end"] {
      justify-content: flex-end;
    }

    div[data-justify="between"] {
      justify-content: space-between;
    }

    div[data-justify="center"] {
      justify-content: center;
    }

    div[align="center"] {
      align-items: center;
    }

    div[align="start"] {
      align-items: start;
    }

    div[align="end"] {
      align-items: end;
    }
  `

  protected render() {
    return html`<div
      data-direction="${this.direction}"
      data-gap="${this.gap}"
      data-wrap=${this.wrap}
      data-justify="${this.justify}"
      data-align="${this.align}"
    >
      <slot></slot>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-flex": FlexElement
  }
}
