import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property, queryAssignedElements } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

/**
 * `a-dropdown-menu` — a click-triggered menu. Mirrors `a-popover`'s
 * trigger/content/positioning/open pattern. Slots: `trigger`, `content`.
 * Emits `open-change` (CustomEvent<{open:boolean}>).
 *
 * Content is composed from `a-dropdown-item`, `a-dropdown-label` and
 * `a-dropdown-separator`. Items dispatch a bubbling `select` event that the
 * root listens for to auto-close the menu.
 */
@customElement('a-dropdown-menu')
export class DropdownMenuElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare open: boolean
  @property({ reflect: true }) declare side: 'top' | 'right' | 'bottom' | 'left'
  @property({ reflect: true }) declare align: 'start' | 'center' | 'end'
  @property({ type: Number }) declare sideOffset: number

  @queryAssignedElements({ slot: 'trigger' })
  private declare triggerElements: HTMLElement[]

  constructor() {
    super()
    this.open = false
    this.side = 'bottom'
    this.align = 'start'
    this.sideOffset = 4
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .content {
      position: absolute;
      z-index: 50;
      min-width: 10rem;
      max-width: 20rem;
      background: var(--popover, oklch(98% 0 0));
      color: var(--popover-foreground, oklch(20% 0 0));
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.5rem);
      padding: 0.25rem;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
      outline: none;
      pointer-events: auto;
      transform-origin: var(--transform-origin, 50% 0%);
    }

    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
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

    .animate-in {
      animation:
        fade-in 0.12s ease-out forwards,
        zoom-in-95 0.12s ease-out forwards;
    }
    [data-side='bottom'].animate-in {
      animation:
        fade-in 0.12s ease-out forwards,
        zoom-in-95 0.12s ease-out forwards,
        slide-in-from-top-2 0.12s ease-out forwards;
    }
    [data-side='top'].animate-in {
      animation:
        fade-in 0.12s ease-out forwards,
        zoom-in-95 0.12s ease-out forwards,
        slide-in-from-bottom-2 0.12s ease-out forwards;
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
      top: 0;
    }
    :host([side='left']) .content {
      right: 100%;
      margin-right: var(--side-offset, 0.25rem);
      top: 0;
    }

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
      left: 0;
    }
    :host([side='bottom'][align='center']) .content,
    :host([side='top'][align='center']) .content,
    :host([side='bottom'][align='end']) .content,
    :host([side='top'][align='end']) .content {
      left: 50%;
      transform: translateX(var(--align-transform, 0%));
    }
  `

  connectedCallback() {
    super.connectedCallback()
    DropdownMenuElement._register(this)
    this.addEventListener('select', this._onItemSelect as EventListener)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    DropdownMenuElement._unregister(this)
    this.removeEventListener('select', this._onItemSelect as EventListener)
  }

  private static _instances = new Set<DropdownMenuElement>()
  private static _listenersAttached = false

  private static _onDocClick = (e: MouseEvent) => {
    DropdownMenuElement._instances.forEach((p) => p._handleOutsideClick(e))
  }
  private static _onDocKey = (e: KeyboardEvent) => {
    DropdownMenuElement._instances.forEach((p) => p._handleKey(e))
  }

  private static _register(p: DropdownMenuElement) {
    DropdownMenuElement._instances.add(p)
    if (!DropdownMenuElement._listenersAttached) {
      document.addEventListener('click', DropdownMenuElement._onDocClick)
      document.addEventListener('keydown', DropdownMenuElement._onDocKey)
      DropdownMenuElement._listenersAttached = true
    }
  }

  private static _unregister(p: DropdownMenuElement) {
    DropdownMenuElement._instances.delete(p)
    if (
      DropdownMenuElement._instances.size === 0 &&
      DropdownMenuElement._listenersAttached
    ) {
      document.removeEventListener('click', DropdownMenuElement._onDocClick)
      document.removeEventListener('keydown', DropdownMenuElement._onDocKey)
      DropdownMenuElement._listenersAttached = false
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
    if (this.contains(target)) return
    this._setOpenInternal(false)
  }

  private _handleKey = (e: KeyboardEvent) => {
    if (!this.open) return
    if (e.key === 'Escape') {
      this._setOpenInternal(false)
      e.preventDefault()
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      this._moveFocus(e.key === 'ArrowDown' ? 1 : -1)
    }
  }

  private _items(): DropdownItemElement[] {
    return Array.from(
      this.querySelectorAll('a-dropdown-item'),
    ).filter((el) => !(el as DropdownItemElement).disabled) as DropdownItemElement[]
  }

  private _moveFocus(dir: 1 | -1) {
    const items = this._items()
    if (items.length === 0) return
    const active = document.activeElement
    let idx = items.findIndex((el) => el === active)
    if (idx < 0) idx = dir === 1 ? -1 : 0
    idx = (idx + dir + items.length) % items.length
    items[idx]?.focus()
  }

  private _onItemSelect = () => {
    this._setOpenInternal(false)
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
        new CustomEvent('open-change', {
          detail: { open: this.open },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  render() {
    const contentClasses = classMap({
      content: true,
      'animate-in': this.open,
    })

    return html`
      <div class="trigger">
        <slot name="trigger"></slot>
      </div>

      ${this.open
        ? html`
            <div
              class=${contentClasses}
              role="menu"
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

/**
 * `a-dropdown-item` — a clickable menu row. Default slot = label,
 * `slot="icon"` = leading icon. Emits a bubbling+composed `select` event.
 */
@customElement('a-dropdown-item')
export class DropdownItemElement extends LitElement {
  @property({ type: Boolean, reflect: true }) declare disabled: boolean
  @property({ reflect: true }) declare variant: 'default' | 'destructive'

  constructor() {
    super()
    this.disabled = false
    this.variant = 'default'
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      box-sizing: border-box;
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--foreground);
      background: transparent;
      border: none;
      border-radius: calc(var(--radius, 0.5rem) - 0.25rem);
      cursor: pointer;
      text-align: left;
      user-select: none;
      transition: background-color 0.12s ease, color 0.12s ease;
      outline: none;
    }

    .item:hover:not([data-disabled]),
    .item:focus-visible:not([data-disabled]) {
      background: var(--accent);
      color: var(--accent-foreground);
    }

    :host([variant='destructive']) .item {
      color: var(--destructive);
    }
    :host([variant='destructive']) .item:hover:not([data-disabled]),
    :host([variant='destructive']) .item:focus-visible:not([data-disabled]) {
      background: color-mix(in oklch, var(--destructive) 12%, transparent);
      color: var(--destructive);
    }

    .item[data-disabled] {
      opacity: 0.5;
      pointer-events: none;
      cursor: default;
    }

    ::slotted([slot='icon']) {
      display: inline-flex;
      width: 1rem;
      height: 1rem;
      flex: none;
    }
  `

  private _onClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation()
      return
    }
    this.dispatchEvent(
      new CustomEvent('select', { bubbles: true, composed: true }),
    )
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      this._onClick(e)
    }
  }

  render() {
    return html`
      <div
        class="item"
        role="menuitem"
        tabindex=${this.disabled ? -1 : 0}
        ?data-disabled=${this.disabled}
        @click=${this._onClick}
        @keydown=${this._onKeyDown}
      >
        <slot name="icon"></slot>
        <span class="label"><slot></slot></span>
      </div>
    `
  }
}

/** `a-dropdown-label` — a non-interactive heading row. */
@customElement('a-dropdown-label')
export class DropdownLabelElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    .label {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--muted-foreground);
    }
  `

  render() {
    return html`<div class="label"><slot></slot></div>`
  }
}

/** `a-dropdown-separator` — a thin divider between groups of items. */
@customElement('a-dropdown-separator')
export class DropdownSeparatorElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    .separator {
      height: 1px;
      margin: 0.25rem -0.25rem;
      background: var(--border);
    }
  `

  render() {
    return html`<div class="separator" role="separator"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-dropdown-menu': DropdownMenuElement
    'a-dropdown-item': DropdownItemElement
    'a-dropdown-label': DropdownLabelElement
    'a-dropdown-separator': DropdownSeparatorElement
  }
}
