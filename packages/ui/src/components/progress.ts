import { type CSSResultGroup, css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('a-progress')
export class ProgressElement extends LitElement {
  @property({ type: Number, reflect: true }) declare value: number;

  constructor() {
    super();
    this.value = 0;
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
    }

    .track {
      position: relative;
      width: 100%;
      height: 0.5rem;
      overflow: hidden;
      background: var(--muted);
      border-radius: 9999px;
    }

    .bar {
      height: 100%;
      background: var(--primary);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
  `;

  private get _clamped() {
    return Math.max(0, Math.min(100, this.value ?? 0));
  }

  render() {
    return html`
      <div
        class="track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this._clamped}
      >
        <div class="bar" style="width: ${this._clamped}%"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'a-progress': ProgressElement;
  }
}
