import { css, html, LitElement, type PropertyValues } from "lit"
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js"

@customElement("a-tabs")
export class TabsElement extends LitElement {
  @property({ type: String, reflect: true })
  value = ""

  @queryAssignedElements({ selector: "a-tab" })
  private tabs!: HTMLElement[]

  static styles = css`
    :host {
      display: block;
    }
    .tab-list {
      position: relative;
      display: flex;
      /* gap: 0.25rem; */
      padding: 0.25rem;
      border-radius: var(--radius, 0.5rem);
      background: color-mix(in oklch, var(--background, #fff) 75%, transparent);
      backdrop-filter: blur(12px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
    .indicator {
      position: absolute;
      top: 0.25rem; /* or inset-inline-start: 0; if you want logical props */
      bottom: 0.25rem;
      left: 0;
      height: auto; /* let top/bottom control it */
      border-radius: calc(var(--radius, 0.5rem) - 0.125rem);
      background: var(--primary, #0066cc);
      transition:
        transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
        width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 0;
      will-change: transform, width;
      /* pointer-events: none; */ /* often useful */
    }

    ::slotted(a-tab) {
      position: relative;
      z-index: 1;
    }
  `

  constructor() {
    super()
    this.addEventListener("slotchange", () => this._initialize())
  }

  private _initialize() {
    if (!this.value && this.tabs.length > 0) {
      this.value = (this.tabs[0] as any).value || ""
    }
    this._updateIndicator()
    this._updatePanelsAndTabs()
    this.requestUpdate()
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    requestAnimationFrame(() => {
      if (!this.value && this.tabs.length > 0) {
        this.value = (this.tabs[0] as any).value || ""
      }
      this._updateIndicator()
      this._updatePanelsAndTabs()
    })
  }

  updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("value")) {
      this._updateIndicator()
      this._updatePanelsAndTabs()
    }
  }

  private _updateIndicator() {
    const indicator = this.renderRoot.querySelector(
      ".indicator",
    ) as HTMLElement | null
    if (!indicator) return

    const activeTab = this.tabs.find((el) => (el as any).value === this.value)
    if (!activeTab) {
      indicator.style.width = "0"
      return
    }

    const container = this.renderRoot.querySelector(".tab-list") as HTMLElement
    const tabRect = activeTab.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const left = tabRect.left - containerRect.left + container.scrollLeft
    const width = tabRect.width

    indicator.style.width = `${width}px`
    indicator.style.transform = `translateX(${left}px)`
  }

  private _updatePanelsAndTabs() {
    this.tabs.forEach((tab) => {
      const isActive = (tab as any).value === this.value
      tab.toggleAttribute("active", isActive)
      tab.setAttribute("aria-selected", isActive ? "true" : "false")
    })

    const panels = this.querySelectorAll(
      "a-tab-panel",
    ) as NodeListOf<TabPanelElement>
    panels.forEach((panel) => {
      const isActive = panel.value === this.value
      panel.toggleAttribute("active", isActive)
      panel.hidden = !isActive
    })
  }

  private onTabClick(e: Event) {
    const tab = (e.target as HTMLElement).closest("a-tab") as TabElement | null
    if (!tab) return

    // Prevent action if tab is disabled
    if (tab.disabled) return

    const newValue = tab.value
    if (newValue && newValue !== this.value) {
      this.value = newValue

      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: newValue },
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      )
    }
  }

  render() {
    return html`
      <div class="tab-list" role="tablist">
        <div class="indicator"></div>
        <slot @click=${this.onTabClick}></slot>
      </div>

      <div class="panels">
        <slot name="panel"></slot>
      </div>
    `
  }
}

// ==================== TAB ELEMENT WITH DISABLED SUPPORT ====================

@customElement("a-tab")
export class TabElement extends LitElement {
  @property({ type: String, reflect: true })
  value = ""

  @property({ type: Boolean, reflect: true })
  active = false

  @property({ type: Boolean, reflect: true })
  disabled = false

  @property({})
  class: string | undefined

  static styles = css`
    :host {
      display: block;
      flex: 1 1 auto;
      width: 100%;
    }
    button {
      min-height: 2rem;
      height: 100%;
      padding: 0 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      justify-content: center;
      text-align: center;
      width: 100%;
      border: none;
      border-radius: calc(var(--radius, 0.5rem) - 0.125rem);
      background: transparent;
      color: var(--muted-foreground, #64748b);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
      white-space: nowrap;
    }

    :host([active]) button {
      color: var(--primary-foreground, white);
      font-weight: 600;
    }

    :host([disabled]) button {
      color: var(--disabled-foreground, #94a3b8);
      cursor: not-allowed;
      opacity: 0.6;
    }

    :host([disabled][active]) button {
      color: var(--primary-foreground, white);
      opacity: 0.85;
    }

    button:focus-visible {
      outline: 2px solid var(--primary, #0066cc);
      outline-offset: 2px;
    }
  `

  render() {
    return html`
      <button
        .class=${this.class}
        role="tab"
        aria-selected=${this.active ? "true" : "false"}
        aria-disabled=${this.disabled ? "true" : "false"}
        tabindex=${this.active && !this.disabled ? "0" : "-1"}
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `
  }
}

@customElement("a-tab-panel")
export class TabPanelElement extends LitElement {
  @property({ type: String, reflect: true })
  value = ""

  static styles = css`
    :host {
      display: block;
    }
    :host(:not([active])) {
      display: none;
    }
    .content {
      padding-top: 1rem;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.22s ease-out;
    }
    :host([active]) .content {
      opacity: 1;
      transform: translateY(0);
    }
  `

  render() {
    return html`
      <div class="content" role="tabpanel">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-tab-panel": TabPanelElement
    "a-tabs": TabsElement
    "a-tab": TabElement
  }
}
