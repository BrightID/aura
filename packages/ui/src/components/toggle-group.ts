import { css, html, LitElement, type CSSResultGroup } from "lit"
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js"
import type { ToggleElement } from "./toggle"

export type ToggleGroupType = "single" | "multiple"

@customElement("a-toggle-group")
export class ToggleGroupElement extends LitElement {
  /** Space-separated in `multiple` mode; a single value in `single` mode. */
  @property({ reflect: true }) declare value: string
  @property({ reflect: true }) declare type: ToggleGroupType
  @property({ type: Boolean, reflect: true }) declare disabled: boolean

  @queryAssignedElements({ selector: "a-toggle" })
  private declare _toggles: ToggleElement[]

  constructor() {
    super()
    this.value = ""
    this.type = "single"
    this.disabled = false
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  `

  render() {
    return html`
      <slot
        @slotchange=${this._sync}
        @click=${this._onClick}
      ></slot>
    `
  }

  updated() {
    this._sync()
  }

  private get _selected(): Set<string> {
    return new Set(this.value.split(" ").filter(Boolean))
  }

  private _sync = () => {
    const selected = this._selected
    for (const t of this._toggles) {
      if (this.disabled) t.disabled = true
      if (t.value != null) t.pressed = selected.has(t.value)
    }
  }

  private _onClick = (e: MouseEvent) => {
    if (this.disabled) return
    const toggle = (e.target as HTMLElement)?.closest?.(
      "a-toggle",
    ) as ToggleElement | null
    if (!toggle || toggle.value == null || !this._toggles.includes(toggle))
      return

    const val = toggle.value
    const selected = this._selected

    if (this.type === "multiple") {
      if (selected.has(val)) selected.delete(val)
      else selected.add(val)
      this.value = [...selected].join(" ")
    } else {
      this.value = selected.has(val) ? "" : val
    }

    this._sync()
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.type === "multiple" ? [...this._selected] : this.value,
        bubbles: false,
        composed: false,
      }),
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-toggle-group": ToggleGroupElement
  }
}
