import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"

@customElement("a-scroll-area")
export class ScrollAreaElement extends LitElement {
  @property({ reflect: true })
  orientation: "vertical" | "horizontal" | "both" = "vertical"

  @state() private _thumbY = { top: 2, height: 0 }
  @state() private _thumbX = { left: 2, width: 0 }
  @state() private _hasScrollY = false
  @state() private _hasScrollX = false
  @state() private _dragging: "y" | "x" | null = null

  @query(".viewport") private _viewport!: HTMLElement
  @query(".content") private _content!: HTMLElement

  private _ro!: ResizeObserver
  private _dragStart = 0
  private _scrollStart = 0

  // Track bar dimensions (exclude 4px total padding)
  private get _trackH() { return (this._viewport?.clientHeight ?? 0) - 4 }
  private get _trackW() { return (this._viewport?.clientWidth ?? 0) - 4 }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }

    .viewport {
      width: 100%;
      height: 100%;
      overflow: scroll;
      scrollbar-width: none;
    }
    .viewport::-webkit-scrollbar {
      display: none;
    }

    .content {
      min-width: 100%;
      display: table;
    }

    /* ── Scrollbar track ── */
    .scrollbar {
      position: absolute;
      display: flex;
      user-select: none;
      touch-action: none;
      padding: 1px;
      background: transparent;
      transition: opacity 0.2s ease;
      opacity: 0;
      z-index: 10;
    }

    :host(:hover) .scrollbar,
    .scrollbar.dragging {
      opacity: 1;
    }

    .scrollbar--y {
      top: 0;
      right: 0;
      bottom: 0;
      width: 10px;
      flex-direction: column;
    }

    .scrollbar--x {
      left: 0;
      right: 0;
      bottom: 0;
      height: 10px;
      flex-direction: row;
    }

    /* ── Thumb ── */
    .thumb {
      position: absolute;
      border-radius: 9999px;
      background: color-mix(in oklch, var(--foreground, #000) 30%, transparent);
      transition: background 0.15s ease;
      cursor: default;
    }

    .thumb:hover,
    .thumb.dragging {
      background: color-mix(in oklch, var(--foreground, #000) 50%, transparent);
    }

    .scrollbar--y .thumb {
      left: 2px;
      width: calc(100% - 4px);
    }

    .scrollbar--x .thumb {
      top: 2px;
      height: calc(100% - 4px);
    }

    .corner {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 10px;
      height: 10px;
    }
  `

  firstUpdated() {
    this._ro = new ResizeObserver(() => this._sync())
    this._ro.observe(this._viewport)
    this._ro.observe(this._content)
    this._viewport.addEventListener("scroll", () => this._sync(), { passive: true })
    this._sync()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._ro?.disconnect()
  }

  private _sync() {
    const vp = this._viewport
    if (!vp) return

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = vp

    // Vertical
    if (scrollHeight > clientHeight + 1) {
      this._hasScrollY = true
      const ratio = clientHeight / scrollHeight
      const height = Math.max(Math.round(this._trackH * ratio), 20)
      const maxScroll = scrollHeight - clientHeight
      const top = maxScroll > 0
        ? Math.round((scrollTop / maxScroll) * (this._trackH - height)) + 2
        : 2
      this._thumbY = { top, height }
    } else {
      this._hasScrollY = false
    }

    // Horizontal
    if (scrollWidth > clientWidth + 1) {
      this._hasScrollX = true
      const ratio = clientWidth / scrollWidth
      const width = Math.max(Math.round(this._trackW * ratio), 20)
      const maxScroll = scrollWidth - clientWidth
      const left = maxScroll > 0
        ? Math.round((scrollLeft / maxScroll) * (this._trackW - width)) + 2
        : 2
      this._thumbX = { left, width }
    } else {
      this._hasScrollX = false
    }
  }

  private _onThumbPointerDown(axis: "y" | "x", e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    this._dragging = axis
    this._dragStart = axis === "y" ? e.clientY : e.clientX
    this._scrollStart = axis === "y"
      ? this._viewport.scrollTop
      : this._viewport.scrollLeft
  }

  private _onThumbPointerMove(axis: "y" | "x", e: PointerEvent) {
    if (this._dragging !== axis) return
    const vp = this._viewport
    const delta = axis === "y" ? e.clientY - this._dragStart : e.clientX - this._dragStart

    if (axis === "y") {
      const scrollRatio = (vp.scrollHeight - vp.clientHeight) / (this._trackH - this._thumbY.height)
      vp.scrollTop = this._scrollStart + delta * scrollRatio
    } else {
      const scrollRatio = (vp.scrollWidth - vp.clientWidth) / (this._trackW - this._thumbX.width)
      vp.scrollLeft = this._scrollStart + delta * scrollRatio
    }
  }

  private _onThumbPointerUp() {
    this._dragging = null
  }

  private _onTrackPointerDown(axis: "y" | "x", e: PointerEvent) {
    // Only fire when clicking the track itself, not the thumb
    if ((e.target as HTMLElement).classList.contains("thumb")) return
    const vp = this._viewport
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

    if (axis === "y") {
      const clickY = e.clientY - rect.top
      const ratio = (clickY - this._thumbY.height / 2) / this._trackH
      vp.scrollTop = ratio * (vp.scrollHeight - vp.clientHeight)
    } else {
      const clickX = e.clientX - rect.left
      const ratio = (clickX - this._thumbX.width / 2) / this._trackW
      vp.scrollLeft = ratio * (vp.scrollWidth - vp.clientWidth)
    }
  }

  render() {
    const showY = this._hasScrollY && (this.orientation === "vertical" || this.orientation === "both")
    const showX = this._hasScrollX && (this.orientation === "horizontal" || this.orientation === "both")

    return html`
      <div class="viewport">
        <div class="content">
          <slot></slot>
        </div>
      </div>

      ${showY ? html`
        <div
          class="scrollbar scrollbar--y ${this._dragging === "y" ? "dragging" : ""}"
          @pointerdown=${(e: PointerEvent) => this._onTrackPointerDown("y", e)}
        >
          <div
            class="thumb ${this._dragging === "y" ? "dragging" : ""}"
            style="top:${this._thumbY.top}px;height:${this._thumbY.height}px"
            @pointerdown=${(e: PointerEvent) => this._onThumbPointerDown("y", e)}
            @pointermove=${(e: PointerEvent) => this._onThumbPointerMove("y", e)}
            @pointerup=${() => this._onThumbPointerUp()}
            @pointercancel=${() => this._onThumbPointerUp()}
          ></div>
        </div>
      ` : ""}

      ${showX ? html`
        <div
          class="scrollbar scrollbar--x ${this._dragging === "x" ? "dragging" : ""}"
          @pointerdown=${(e: PointerEvent) => this._onTrackPointerDown("x", e)}
        >
          <div
            class="thumb ${this._dragging === "x" ? "dragging" : ""}"
            style="left:${this._thumbX.left}px;width:${this._thumbX.width}px"
            @pointerdown=${(e: PointerEvent) => this._onThumbPointerDown("x", e)}
            @pointermove=${(e: PointerEvent) => this._onThumbPointerMove("x", e)}
            @pointerup=${() => this._onThumbPointerUp()}
            @pointercancel=${() => this._onThumbPointerUp()}
          ></div>
        </div>
      ` : ""}

      ${showY && showX ? html`<div class="corner"></div>` : ""}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-scroll-area": ScrollAreaElement
  }
}
