import externalLinkIcon from '@/assets/icons/external-link.svg'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('hero-section')
export class HeroSectionElement extends LitElement {
  @property({ type: String })
  title = 'Aura Verified'

  static styles?: CSSResultGroup = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 0;
      flex: 1;
    }

    .logo {
      width: 10rem;
      height: 10rem;
      position: relative;
      z-index: 12;
    }

    h1.title {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
    }

    .info-text {
      margin: 1rem 0 1.5rem;
      color: #9ca3af;
      font-size: 0.875rem;
      text-align: center;
    }

    .desc-btn {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: none;
      font-weight: 600;
      color: #60a5fa;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .desc-btn:hover {
      color: #3b82f6;
    }

    .desc-btn span {
      margin-right: 0.5rem;
    }
  `
  protected render() {
    return html` <img src="/aura2.png" class="logo" alt="Aura" />

      <div class="container">
        <h1 class="title">${this.title}</h1>
        <p class="info-text">Decentralized verification platform</p>

        <a href="https://brightid.gitbook.io/aura" target="_blank" class="desc-btn">
          <span>What is Aura?</span>
          <img src=${externalLinkIcon} alt="Aura" />
        </a>
      </div>`
  }
}
