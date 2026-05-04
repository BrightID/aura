import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property, queryAssignedElements } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

@customElement('a-popover')
export class PopoverElement extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false
  @property({ reflect: true }) side: 'top' | 'right' | 'bottom' | 'left' = 'bottom'
  @property({ reflect: true }) align: 'start' | 'center' | 'end' = 'center'
  @property({ type: Number }) sideOffset = 4

  @queryAssignedElements({ slot: 'trigger' }) private triggerElements!: HTMLElement[]

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .content {
      position: absolute;
      z-index: 50;
      min-width: 18rem; /* ≈ w-72 = 18rem */
      max-width: 24rem;
      background: var(--popover, oklch(98% 0 0));
      color: var(--popover-foreground, oklch(20% 0 0));
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.5rem);
      padding: 1rem;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
      outline: none;
      pointer-events: auto;
    }

    /* ─── Animation Keyframes ──────────────────────────────────────── */
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    @keyframes zoom-in-95 {
      from {
        transform: scale(0.95);
      }
      to {
        transform: scale(1);
      }
    }
    @keyframes zoom-out-95 {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(0.95);
      }
    }

    /* Slide directions — values inspired by shadcn (≈ translate 0.5rem = 8px) */
    @keyframes slide-in-from-top-2 {
      from {
        transform: translateY(-0.5rem);
      }
      to {
        transform: translateY(0);
      }
    }
    @keyframes slide-in-from-bottom-2 {
      from {
        transform: translateY(0.5rem);
      }
      to {
        transform: translateY(0);
      }
    }
    @keyframes slide-in-from-left-2 {
      from {
        transform: translateX(-0.5rem);
      }
      to {
        transform: translateX(0);
      }
    }
    @keyframes slide-in-from-right-2 {
      from {
        transform: translateX(0.5rem);
      }
      to {
        transform: translateX(0);
      }
    }

    /* Combined animate-in / animate-out */
    .animate-in {
      animation:
        fade-in 0.15s ease-out forwards,
        zoom-in-95 0.15s ease-out forwards;
    }
    .animate-out {
      animation:
        fade-out 0.15s ease-in forwards,
        zoom-out-95 0.15s ease-in forwards;
    }

    /* Side-specific slide (added to animate-in only) */
    [data-side='bottom'].animate-in {
      animation:
        fade-in 0.15s ease-out forwards,
        zoom-in-95 0.15s ease-out forwards,
        slide-in-from-top-2 0.15s ease-out forwards;
    }
    [data-side='top'].animate-in {
      animation:
        fade-in 0.15s ease-out forwards,
        zoom-in-95 0.15s ease-out forwards,
        slide-in-from-bottom-2 0.15s ease-out forwards;
    }
    [data-side='left'].animate-in {
      animation:
        fade-in 0.15s ease-out forwards,
        zoom-in-95 0.15s ease-out forwards,
        slide-in-from-right-2 0.15s ease-out forwards;
    }
    [data-side='right'].animate-in {
      animation:
        fade-in 0.15s ease-out forwards,
        zoom-in-95 0.15s ease-out forwards,
        slide-in-from-left-2 0.15s ease-out forwards;
    }

    /* Positioning base */
    .content {
      transform-origin: var(--transform-origin, 50% 0%);
    }

    :host([side='bottom']) .content {
      top: 100%;
      margin-top: var(--side-offset, 0.25rem);
    }
    :host([side='top']) .content {
      bottom: 100%;
      margin-bottom: var(--side-offset, 0.25rem);
    }
    :host([side='right']) .content {
      left: 100%;
      margin-left: var(--side-offset, 0.25rem);
      top: 50%;
      transform: translateY(-50%);
    }
    :host([side='left']) .content {
      right: 100%;
      margin-right: var(--side-offset, 0.25rem);
      top: 50%;
      transform: translateY(-50%);
    }

    /* Align adjustments */
    :host([align='start']) .content {
      --align-transform: 0%;
    }
    :host([align='center']) .content {
      --align-transform: -50%;
    }
    :host([align='end']) .content {
      --align-transform: -100%;
    }

    :host([side='bottom']) .content,
    :host([side='top']) .content {
      left: 50%;
      transform: translateX(var(--align-transform, -50%));
    }
  `

  connectedCallback() {
    super.connectedCallback()
    PopoverElement._register(this)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    PopoverElement._unregister(this)
  }

  private static _instances = new Set<PopoverElement>()
  private static _listenersAttached = false

  private static _onDocClick = (e: MouseEvent) => {
    PopoverElement._instances.forEach((p) => p._handleOutsideClick(e))
  }
  private static _onDocKey = (e: KeyboardEvent) => {
    PopoverElement._instances.forEach((p) => p._handleEsc(e))
  }

  private static _register(p: PopoverElement) {
    PopoverElement._instances.add(p)
    if (!PopoverElement._listenersAttached) {
      document.addEventListener('click', PopoverElement._onDocClick)
      document.addEventListener('keydown', PopoverElement._onDocKey)
      PopoverElement._listenersAttached = true
    }
  }

  private static _unregister(p: PopoverElement) {
    PopoverElement._instances.delete(p)
    if (PopoverElement._instances.size === 0 && PopoverElement._listenersAttached) {
      document.removeEventListener('click', PopoverElement._onDocClick)
      document.removeEventListener('keydown', PopoverElement._onDocKey)
      PopoverElement._listenersAttached = false
    }
  }

  private _internalChange = false

  private _setOpenInternal(next: boolean) {
    if (this.open === next) return
    this._internalChange = true
    this.open = next
  }

  private _handleTriggerClick = (e: Event) => {
    e.stopPropagation()
    this._setOpenInternal(!this.open)
  }

  private _handleOutsideClick = (e: MouseEvent) => {
    if (!this.open) return

    const target = e.target as Node | null
    if (!target) return

    if (this.contains(target)) {
      return
    }

    this._setOpenInternal(false)
  }

  private _handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this._setOpenInternal(false)
      e.preventDefault()
    }
  }

  private _attachTriggerListeners() {
    this.triggerElements.forEach((el) => {
      el.addEventListener('click', this._handleTriggerClick)
    })
  }

  firstUpdated() {
    this._attachTriggerListeners()
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && this._internalChange) {
      this._internalChange = false
      this.dispatchEvent(
        new CustomEvent('open-changed', {
          detail: { open: this.open },
          bubbles: true,
          composed: true
        })
      )
    }
  }

  render() {
    const contentClasses = classMap({
      content: true,
      'animate-in': this.open,
    })

    return html`
      <!-- Trigger slot -->
      <div class="trigger">
        <slot name="trigger"></slot>
      </div>

      <!-- Content (no portal in this simple version – can add later if needed) -->
      ${this.open
        ? html`
            <div
              class=${contentClasses}
              data-side=${this.side}
              data-state=${this.open ? 'open' : 'closed'}
              style="--side-offset: ${this.sideOffset}px;"
            >
              <slot name="content"></slot>
            </div>
          `
        : ''}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-popover': PopoverElement
  }
}
