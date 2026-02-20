import { LitElement, css, html } from "lit"
import { customElement } from "lit/decorators.js"
import "./components/theme-provider"
import "./composables/card-section"
import "./composables/dialog-section"
import "./composables/grids-section"
import "./composables/popovers-section"
import "./composables/tabs-section"
import "./index"

@customElement("my-element")
export class MyElement extends LitElement {
  render() {
    return html`
      <a-container>
        <a-head level="1"> Aura UI Design Components Preview </a-head>

        <a-separator></a-separator>

        <a-flex gap="4">
          <div>
            <cards-section></cards-section>
            <dialog-section></dialog-section>

            <a-separator></a-separator>
            <tabs-section></tabs-section>
          </div>
          <div>
            <grids-section></grids-section>
            <popovers-section></popovers-section>
          </div>
        </a-flex>
      </a-container>

      <a-toaster></a-toaster>
    `
  }

  static styles = css``
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement
  }
}
