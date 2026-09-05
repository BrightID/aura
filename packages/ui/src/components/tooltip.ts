import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const PORTAL_ID = 'a-tooltip-portal';
const VIEWPORT_MARGIN = 8;

function getPortal(): HTMLElement {
  let portal = document.getElementById(PORTAL_ID);
  if (!portal) {
    portal = document.createElement('div');
    portal.id = PORTAL_ID;
    document.body.appendChild(portal);
  }
  return portal;
}

/**
 * Positions/sizes the bubble via inline styles + fixed positioning (portaled to
 * document.body) so it is never clipped or forced to expand an ancestor's
 * overflow — a shadow-DOM-local popup would otherwise be cut off by any
 * parent with `overflow: hidden` or cause the page to scroll horizontally.
 */
@customElement('a-tooltip')
export class TooltipElement extends LitElement {
  @property() declare content: string;
  @property({ reflect: true }) declare side:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';
  @property({ type: Number }) declare sideOffset: number;
  @property({ type: Number }) declare openDelay: number;
  @property({ type: Number }) declare closeDelay: number;

  @state() declare private _open: boolean;

  private _openTimer?: number;
  private _closeTimer?: number;
  private _hideTimer?: number;
  private _bubble?: HTMLDivElement;

  constructor() {
    super();
    this.content = '';
    this.side = 'top';
    this.sideOffset = 6;
    this.openDelay = 200;
    this.closeDelay = 100;
    this._open = false;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseenter', this._handleEnter);
    this.addEventListener('mouseleave', this._handleLeave);
    this.addEventListener('focusin', this._handleEnter);
    this.addEventListener('focusout', this._handleLeave);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseenter', this._handleEnter);
    this.removeEventListener('mouseleave', this._handleLeave);
    this.removeEventListener('focusin', this._handleEnter);
    this.removeEventListener('focusout', this._handleLeave);
    clearTimeout(this._openTimer);
    clearTimeout(this._closeTimer);
    clearTimeout(this._hideTimer);
    this._destroyBubble();
  }

  private _handleEnter = () => {
    clearTimeout(this._closeTimer);
    clearTimeout(this._hideTimer);
    this._openTimer = window.setTimeout(() => this._show(), this.openDelay);
  };

  private _handleLeave = () => {
    clearTimeout(this._openTimer);
    this._closeTimer = window.setTimeout(() => this._hide(), this.closeDelay);
  };

  private _show() {
    if (!this.content) return;
    this._open = true;
    this._createBubble();
    // Measure + place first (instant, untransitioned left/top), *then* on a
    // later frame flip the opacity/scale so the transition animates in place
    // instead of sliding in from the (0, 0) corner it was created at.
    requestAnimationFrame(() => {
      this._position();
      requestAnimationFrame(() => this._playEnter());
    });
    window.addEventListener('scroll', this._position, true);
    window.addEventListener('resize', this._position);
  }

  private _hide() {
    this._open = false;
    window.removeEventListener('scroll', this._position, true);
    window.removeEventListener('resize', this._position);
    const bubble = this._bubble;
    if (bubble) {
      bubble.style.opacity = '0';
      bubble.style.transform = 'scale(0.96)';
      this._hideTimer = window.setTimeout(() => {
        if (!this._open) this._destroyBubble();
      }, 120);
    }
  }

  private _playEnter() {
    const bubble = this._bubble;
    if (!bubble) return;
    bubble.style.opacity = '1';
    bubble.style.transform = 'scale(1)';
  }

  private _createBubble() {
    this._destroyBubble();
    const bubble = document.createElement('div');
    bubble.setAttribute('role', 'tooltip');
    bubble.textContent = this.content;
    Object.assign(bubble.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      pointerEvents: 'none',
      zIndex: '10000',
      maxWidth: '16rem',
      width: 'max-content',
      padding: '0.375rem 0.625rem',
      borderRadius: 'var(--radius, 0.375rem)',
      background: 'var(--popover, var(--foreground, #18181b))',
      color: 'var(--popover-foreground, var(--background, #fff))',
      border: '1px solid var(--border, transparent)',
      fontSize: '0.75rem',
      lineHeight: '1.3',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.25)',
      opacity: '0',
      transform: 'scale(0.96)',
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-line',
      transition: 'opacity 0.12s ease, transform 0.12s ease',
    });
    getPortal().appendChild(bubble);
    this._bubble = bubble;
  }

  private _destroyBubble() {
    this._bubble?.remove();
    this._bubble = undefined;
  }

  /**
   * Computes fixed coordinates from the trigger's bounding rect, flips to
   * the opposite side when there isn't room, then clamps the result inside
   * the viewport so the bubble can never push the page into overflow.
   */
  private _position = () => {
    const bubble = this._bubble;
    if (!bubble) return;

    const trigger = this.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const gap = this.sideOffset;

    let side = this.side;
    if (
      side === 'top' &&
      trigger.top - bubbleRect.height - gap < VIEWPORT_MARGIN
    ) {
      side = 'bottom';
    } else if (
      side === 'bottom' &&
      trigger.bottom + gap + bubbleRect.height >
        window.innerHeight - VIEWPORT_MARGIN
    ) {
      side = 'top';
    } else if (
      side === 'left' &&
      trigger.left - bubbleRect.width - gap < VIEWPORT_MARGIN
    ) {
      side = 'right';
    } else if (
      side === 'right' &&
      trigger.right + gap + bubbleRect.width >
        window.innerWidth - VIEWPORT_MARGIN
    ) {
      side = 'left';
    }

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = trigger.top - bubbleRect.height - gap;
        left = trigger.left + trigger.width / 2 - bubbleRect.width / 2;
        break;
      case 'bottom':
        top = trigger.bottom + gap;
        left = trigger.left + trigger.width / 2 - bubbleRect.width / 2;
        break;
      case 'left':
        top = trigger.top + trigger.height / 2 - bubbleRect.height / 2;
        left = trigger.left - bubbleRect.width - gap;
        break;
      case 'right':
        top = trigger.top + trigger.height / 2 - bubbleRect.height / 2;
        left = trigger.right + gap;
        break;
    }

    left = Math.min(
      Math.max(left, VIEWPORT_MARGIN),
      window.innerWidth - bubbleRect.width - VIEWPORT_MARGIN,
    );
    top = Math.min(
      Math.max(top, VIEWPORT_MARGIN),
      window.innerHeight - bubbleRect.height - VIEWPORT_MARGIN,
    );

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  };

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-tooltip': TooltipElement;
  }
}
