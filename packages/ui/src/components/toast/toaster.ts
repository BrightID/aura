import { LitElement, css, html } from "lit"
import { customElement, state } from "lit/decorators.js"
import { type ToastData, type ToastVariant, subscribe, toast } from "./toast.ts"

@customElement("a-toaster")
export class ToasterElement extends LitElement {
  @state() private toasts: ToastData[] = []

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      font-family: system-ui, sans-serif;
      --toast-radius: var(--radius, 0.75rem);
      --toast-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.3);
    }

    .container {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 80vh;
      overflow: visible;
    }

    .toast {
      pointer-events: auto;
      position: relative;
      min-width: 320px;
      max-width: 420px;
      padding: 1rem 1.25rem;
      border-radius: var(--toast-radius);
      background: var(--card);
      border: 1px solid var(--border);
      backdrop-filter: blur(10px) saturate(1.3);
      color: var(--card-foreground);
      box-shadow: var(--toast-shadow);
      transform: translateX(calc(100% + 2rem)) scale(0.96);
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
      will-change: transform, opacity;
      cursor: default;
      user-select: none;
    }

    .toast.visible {
      transform: translateX(0) scale(1);
      opacity: 1;
    }

    .toast.exit {
      transform: translateX(calc(100% + 2rem)) scale(0.9);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
    }

    /* Stacking animation for multiple toasts */
    .toast:not(:last-child) {
      margin-bottom: -0.5rem;
    }

    .content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      line-height: 1;
    }

    .text-content {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-weight: 600;
      font-size: 0.925rem;
      line-height: 1.4;
      color: var(--card-foreground);
    }

    .description {
      font-size: 0.875rem;
      line-height: 1.4;
      margin-top: 0.25rem;
      color: var(--muted-foreground);
    }

    /* Variant colors */
    .toast.success {
      border-color: color-mix(in oklch, var(--aura-success) 40%, transparent);
      background: color-mix(in oklch, var(--card) 90%, var(--aura-success) 10%);
    }

    .toast.success .icon {
      color: var(--aura-success);
    }

    .toast.error {
      border-color: color-mix(in oklch, var(--destructive) 40%, transparent);
      background: color-mix(in oklch, var(--card) 90%, var(--destructive) 10%);
    }

    .toast.error .icon {
      color: var(--destructive);
    }

    .toast.warning {
      border-color: color-mix(in oklch, var(--aura-warning) 40%, transparent);
      background: color-mix(in oklch, var(--card) 90%, var(--aura-warning) 10%);
    }

    .toast.warning .icon {
      color: var(--aura-warning);
    }

    .toast.info {
      border-color: color-mix(in oklch, var(--aura-info) 40%, transparent);
      background: color-mix(in oklch, var(--card) 90%, var(--aura-info) 10%);
    }

    .toast.info .icon {
      color: var(--aura-info);
    }

    .toast.loading .icon {
      color: var(--muted-foreground);
    }

    /* Loading spinner */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid color-mix(in oklch, currentColor 30%, transparent);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Hover effect */
    .toast:hover {
      box-shadow: 0 12px 35px -10px rgba(0, 0, 0, 0.4);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this.removeOnUnmount = subscribe((ts) => {
      this.toasts = ts
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeOnUnmount?.()
  }

  private removeOnUnmount?: () => void

  private renderIcon(variant?: ToastVariant) {
    switch (variant) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "info":
        return "ℹ"
      case "loading":
        return null
      default:
        return "→"
    }
  }

  render() {
    return html`
      <div class="container">
        ${this.toasts.map(
          (t) => html`
            <div
              class="toast ${t.visible ? "visible" : "exit"} ${t.variant ||
              "default"}"
              @pointerdown=${(e: PointerEvent) =>
                this.handleSwipeStart(e, t.id)}
              @pointermove=${(e: PointerEvent) => this.handleSwipeMove(e)}
              @pointerup=${(e: PointerEvent) => this.handleSwipeEnd(e, t.id)}
              @pointercancel=${() => this.resetSwipe()}
              @click=${() => toast.dismiss(t.id)}
            >
              <div class="content">
                ${t.variant === "loading"
                  ? html`<div class="spinner"></div>`
                  : html`<span class="icon"
                      >${this.renderIcon(t.variant)}</span
                    >`}
                <div class="text-content">
                  <div class="title">${t.message}</div>
                  ${t.description
                    ? html`<div class="description">${t.description}</div>`
                    : ""}
                </div>
              </div>
            </div>
          `,
        )}
      </div>
    `
  }

  private swipeStartX = 0
  private swipeStartY = 0
  private currentToastId: string | null = null

  private handleSwipeStart(e: PointerEvent, id: string) {
    if (e.pointerType !== "mouse" && e.pointerType !== "touch") return
    this.currentToastId = id
    this.swipeStartX = e.clientX
    this.swipeStartY = e.clientY
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  private handleSwipeMove(e: PointerEvent) {
    if (!this.currentToastId) return
    const dx = e.clientX - this.swipeStartX
    if (dx > 60) {
      toast.dismiss(this.currentToastId)
      this.resetSwipe()
    }
  }

  private handleSwipeEnd(e: PointerEvent, id: string) {
    this.resetSwipe()
  }

  private resetSwipe() {
    this.currentToastId = null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "a-toaster": ToasterElement
  }
}
