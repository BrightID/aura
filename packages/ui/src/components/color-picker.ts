import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import './popover';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** Delegates arbitrary CSS color syntax (oklch, hex, rgb, hsl, named…) to the browser's own parser. */
function parseToRgb(value: string): Rgb {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0]!, g: data[1]!, b: data[2]! };
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, v: max * 100 };
}

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

@customElement('a-color-picker')
export class ColorPickerElement extends LitElement {
  @property({ reflect: true }) declare value: string;
  @property() declare label: string | undefined;
  @property({ type: Boolean }) declare disabled: boolean;

  @state() declare private _h: number;
  @state() declare private _s: number;
  @state() declare private _v: number;
  @state() declare private _text: string;

  private _suppressSync = false;

  constructor() {
    super();
    this.value = '#000000';
    this.label = undefined;
    this.disabled = false;
    this._h = 0;
    this._s = 0;
    this._v = 0;
    this._text = this.value;
    this._syncFromValue(this.value);
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('value')) {
      if (this._suppressSync) this._suppressSync = false;
      else this._syncFromValue(this.value);
    }
  }

  private _syncFromValue(value: string) {
    try {
      const { r, g, b } = parseToRgb(value);
      const { h, s, v } = rgbToHsv(r, g, b);
      this._h = h;
      this._s = s;
      this._v = v;
      this._text = value;
    } catch {
      /* unparsable — keep last known good hsv */
    }
  }

  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    label {
      font-size: var(--sm);
      font-weight: 500;
      color: var(--muted-foreground);
    }

    .swatch-btn {
      all: unset;
      box-sizing: border-box;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      background-image:
        linear-gradient(
          45deg,
          color-mix(in oklch, var(--muted-foreground) 18%, transparent) 25%,
          transparent 25%
        ),
        linear-gradient(
          -45deg,
          color-mix(in oklch, var(--muted-foreground) 18%, transparent) 25%,
          transparent 25%
        ),
        linear-gradient(
          45deg,
          transparent 75%,
          color-mix(in oklch, var(--muted-foreground) 18%, transparent) 75%
        ),
        linear-gradient(
          -45deg,
          transparent 75%,
          color-mix(in oklch, var(--muted-foreground) 18%, transparent) 75%
        );
      background-size: 8px 8px;
      background-position:
        0 0,
        0 4px,
        4px -4px,
        -4px 0px;
    }

    .swatch-btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--swatch-color);
    }

    .swatch-btn:hover {
      border-color: color-mix(
        in oklch,
        var(--border) 85%,
        var(--foreground) 15%
      );
    }

    .swatch-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .swatch-btn:disabled {
      opacity: 0.52;
      cursor: not-allowed;
    }

    .panel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 14rem;
    }

    .sv {
      position: relative;
      width: 100%;
      height: 8rem;
      border-radius: calc(var(--radius) - 2px);
      background-color: hsl(var(--hue) 100% 50%);
      background-image:
        linear-gradient(to top, #000, transparent),
        linear-gradient(to right, #fff, transparent);
      cursor: crosshair;
      touch-action: none;
    }

    .sv-thumb {
      position: absolute;
      width: 0.875rem;
      height: 0.875rem;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow:
        0 0 0 1px oklch(0 0 0 / 0.35),
        0 1px 2px oklch(0 0 0 / 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .hue {
      position: relative;
      width: 100%;
      height: 0.875rem;
      border-radius: 999px;
      background: linear-gradient(
        to right,
        red,
        yellow,
        lime,
        cyan,
        blue,
        magenta,
        red
      );
      cursor: pointer;
      touch-action: none;
    }

    .hue-thumb {
      position: absolute;
      top: 50%;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: white;
      border: 2px solid white;
      box-shadow:
        0 0 0 1px oklch(0 0 0 / 0.35),
        0 1px 2px oklch(0 0 0 / 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .text-input {
      width: 100%;
      height: 2.25rem;
      padding: 0 0.625rem;
      box-sizing: border-box;
      font-family: var(--font-geist-mono, monospace);
      font-size: 0.8125rem;
      color: var(--foreground);
      background: color-mix(in oklch, var(--background) 82%, transparent);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) - 2px);
      outline: none;
    }

    .text-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 30%, transparent);
    }
  `;

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ''}
      <a-popover side="bottom" align="start">
        <button
          slot="trigger"
          class="swatch-btn"
          style="--swatch-color: ${this.value}"
          ?disabled=${this.disabled}
          aria-label="Pick color"
        ></button>
        <div slot="content" class="panel">
          <div
            class="sv"
            style="--hue: ${this._h}"
            @pointerdown=${this._onSvPointerDown}
          >
            <div
              class="sv-thumb"
              style="left: ${this._s}%; top: ${100 - this._v}%;"
            ></div>
          </div>
          <div class="hue" @pointerdown=${this._onHuePointerDown}>
            <div
              class="hue-thumb"
              style="left: ${(this._h / 360) * 100}%;"
            ></div>
          </div>
          <input
            class="text-input"
            spellcheck="false"
            .value=${live(this._text)}
            @change=${this._onTextChange}
          />
        </div>
      </a-popover>
    `;
  }

  private _onSvPointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    this._updateSv(e, el);

    const onMove = (ev: PointerEvent) => this._updateSv(ev, el);
    const onUp = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  };

  private _updateSv(e: PointerEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
    this._s = (x / rect.width) * 100;
    this._v = 100 - (y / rect.height) * 100;
    this._emit();
  }

  private _onHuePointerDown = (e: PointerEvent) => {
    if (this.disabled) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    this._updateHue(e, el);

    const onMove = (ev: PointerEvent) => this._updateHue(ev, el);
    const onUp = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  };

  private _updateHue(e: PointerEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    this._h = (x / rect.width) * 360;
    this._emit();
  }

  private _emit() {
    const { r, g, b } = hsvToRgb(this._h, this._s, this._v);
    const hex = rgbToHex(r, g, b);
    this._text = hex;
    this._suppressSync = true;
    this.value = hex;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: hex,
        bubbles: false,
        composed: false,
      }),
    );
  }

  private _onTextChange(e: Event) {
    e.stopPropagation();
    const target = e.target as HTMLInputElement;
    const raw = target.value.trim();
    if (!raw) return;

    try {
      const { r, g, b } = parseToRgb(raw);
      const { h, s, v } = rgbToHsv(r, g, b);
      this._h = h;
      this._s = s;
      this._v = v;
    } catch {
      /* let the browser fail to render the swatch rather than reject input */
    }

    this._suppressSync = true;
    this._text = raw;
    this.value = raw;

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: raw,
        bubbles: false,
        composed: false,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-color-picker': ColorPickerElement;
  }
}
