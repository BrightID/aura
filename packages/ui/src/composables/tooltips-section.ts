import { html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"

@customElement("tooltips-section")
export class TooltipsSectionElement extends LitElement {
  protected render() {
    return html`
      <a-head level="3"> Tooltips Section </a-head>

      <a-flex gap="4" align="center">
        <a-tooltip content="Saves your changes" side="top">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Top
          </button>
        </a-tooltip>

        <a-tooltip content="Shown below the trigger" side="bottom">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Bottom
          </button>
        </a-tooltip>

        <a-tooltip content="Appears on the left" side="left">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Left
          </button>
        </a-tooltip>

        <a-tooltip content="Appears on the right" side="right">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Right
          </button>
        </a-tooltip>

        <a-tooltip
          content="Long descriptions wrap instead of overflowing the viewport, and the bubble flips or clamps itself back on screen near an edge."
          side="top"
        >
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Long content
          </button>
        </a-tooltip>
      </a-flex>

      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <a-tooltip content="Clamped so it never runs off-screen" side="right">
          <button class="px-4 py-2 bg-primary text-primary-foreground rounded">
            Edge of viewport
          </button>
        </a-tooltip>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tooltips-section": TooltipsSectionElement
  }
}
