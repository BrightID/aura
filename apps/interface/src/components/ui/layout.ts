import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import './footer.ts';

@customElement('app-layout')
export class AppLayout extends LitElement {
  @property({
    type: Boolean,
  })
  isEmbeded = false;

  static styles = css`
    :host {
      display: block;
      color: var(--foreground);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .layout-wrapper {
      min-height: 100dvh;
      background: var(--background);
    }

    .layout,
    .embed-layout {
      box-sizing: border-box;
      text-align: center;
      position: relative;
      margin: 0 auto;
      width: 100%;
      max-width: 640px;
      padding: 32px 20px calc(104px + env(safe-area-inset-bottom, 0px));
    }

    .embed-layout {
      max-width: 400px;
      padding: 10px;
    }

    @media (min-width: 640px) {
      .layout {
        padding: 56px 32px 120px;
      }
    }
  `;

  render() {
    if (this.isEmbeded) {
      return html` <div class="embed-layout">
        <slot></slot>
      </div>`;
    }
    return html`
      <div class="layout-wrapper">
        <div class="layout">
          <main>
            <slot></slot>
          </main>
        </div>
      </div>
    `;
  }
}
