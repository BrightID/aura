import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('a-slider')
export class SliderElement extends LitElement {
  @property({ type: Number, reflect: true }) declare value: number;
  @property({ type: Number }) declare min: number;
  @property({ type: Number }) declare max: number;
  @property({ type: Number }) declare step: number;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;

  @query('.track') declare private _track: HTMLElement;

  private _dragging = false;

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.disabled = false;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
      padding: 0.5rem 0;
      touch-action: none;
    }

    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }

    .track {
      position: relative;
      height: 0.375rem;
      border-radius: 999px;
      background: var(--muted);
      cursor: pointer;
    }

    .range {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 999px;
      background: var(--primary);
    }

    .thumb {
      position: absolute;
      top: 50%;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      background: var(--background);
      border: 2px solid var(--primary);
      transform: translate(-50%, -50%);
      box-shadow: 0 1px 3px oklch(0 0 0 / 0.2);
      cursor: grab;
      transition: box-shadow 0.15s ease;
    }

    .thumb:active {
      cursor: grabbing;
    }

    :host(:focus-visible) {
      outline: none;
    }

    :host(:focus-visible) .thumb {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
  `;

  private get _percent() {
    const range = this.max - this.min || 1;
    return ((this.value - this.min) / range) * 100;
  }

  render() {
    const pct = Math.max(0, Math.min(100, this._percent));
    return html`
      <div
        class="track"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${this.value}
        aria-disabled=${this.disabled}
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeyDown}
      >
        <div class="range" style="width: ${pct}%"></div>
        <div class="thumb" style="left: ${pct}%"></div>
      </div>
    `;
  }

  private _clamp(v: number) {
    const stepped =
      Math.round((v - this.min) / this.step) * this.step + this.min;
    return Math.max(this.min, Math.min(this.max, stepped));
  }

  private _setValue(v: number) {
    const next = this._clamp(v);
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.value,
        bubbles: false,
        composed: false,
      }),
    );
  }

  private _valueFromClientX(clientX: number) {
    const rect = this._track.getBoundingClientRect();
    const ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
    return this.min + ratio * (this.max - this.min);
  }

  private _onPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    this._dragging = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this._setValue(this._valueFromClientX(e.clientX));
    this.renderRoot
      .querySelector('.track')
      ?.addEventListener('pointermove', this._onPointerMove as EventListener);
    window.addEventListener('pointerup', this._onPointerUp, { once: true });
  };

  private _onPointerMove = (e: PointerEvent) => {
    if (!this._dragging) return;
    this._setValue(this._valueFromClientX(e.clientX));
  };

  private _onPointerUp = () => {
    this._dragging = false;
    this.renderRoot
      .querySelector('.track')
      ?.removeEventListener(
        'pointermove',
        this._onPointerMove as EventListener,
      );
  };

  private _onKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        this._setValue(this.value + this.step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        this._setValue(this.value - this.step);
        break;
      case 'Home':
        e.preventDefault();
        this._setValue(this.min);
        break;
      case 'End':
        e.preventDefault();
        this._setValue(this.max);
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'a-slider': SliderElement;
  }
}
