import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './footer.ts'

@customElement('app-layout')
export class AppLayout extends LitElement {
  private particlePositions = Array.from({ length: 50 }, () => ({
    width: Math.random() * 2 + 1 + 'px',
    height: Math.random() * 2 + 1 + 'px',
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%'
  }))

  @property({
    type: Boolean
  })
  isEmbeded = false

  static styles = css`
    .layout-wrapper {
      background-color: #0d0d1b;
    }
    .layout {
      text-align: center;
      min-height: 100vh;

      position: relative;
      margin: 0 auto;
      max-width: 400px;
      padding-bottom: 50px;
    }

    .embed-layout {
      text-align: center;
      position: relative;
      margin: 0 auto;
      max-width: 400px;
      padding-bottom: 10px;
    }

    .lamp-bg {
      position: sticky;
      top: -8px;
      width: 1px;
      right: 20px;
      height: 1px;
      margin-left: auto;
      border-radius: 100000px;
      box-shadow: 8px 20px 203px 166px rgba(253, 224, 255, 0.3);
      transform: rotate3d(0, 1, 1, 63deg);
    }

    .bg-lines {
      position: fixed;
      top: 40px;
      height: 300px;
      width: 400px;
      background: url('/images/bg-linear-dashes.svg');
      pointer-events: none;
    }

    .stars {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .star {
      position: absolute;
      border-radius: 10000px;
      background: white;
      opacity: 0.2;
    }

    main {
      padding: 40px 0;
    }
  `

  render() {
    if (this.isEmbeded) {
      return html` <div class="embed-layout">
        <slot></slot>
      </div>`
    }
    return html`
      <div class="layout-wrapper">
        <div class="layout">
          <div class="lamp-bg"></div>
          <div class="bg-lines"></div>

          <div class="stars">
            ${this.particlePositions.map(
              (particle, key) =>
                html` <div
                  class="star"
                  style="width: ${particle.width}; height: ${particle.height}; top: ${particle.top}; left: ${particle.left};"
                ></div>`
            )}
          </div>

          <main>
            <slot></slot>
          </main>
        </div>
      </div>
    `
  }
}
