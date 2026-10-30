import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hero-section')
export class HeroSectionElement extends LitElement {
  @property({ type: String })
  title = 'Aura Verified';

  static styles?: CSSResultGroup = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem 0 0;
      flex: 1;
    }

    .logo {
      width: 4rem;
      height: 4rem;
      position: relative;
      z-index: 12;
    }

    h1.title {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--foreground);
      letter-spacing: -0.04em;
    }

    .info-text {
      margin: 12px 0;
      color: var(--muted-foreground);
      font-size: 0.875rem;
      text-align: center;
    }

    .desc-btn {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: none;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      min-height: 44px;
      transition: color 0.2s ease;
    }

    .desc-btn:hover {
      color: var(--foreground);
    }
    .desc-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 4px;
      border-radius: 4px;
    }

    .desc-btn span {
      margin-right: 0.5rem;
    }
  `;
  protected render() {
    return html` <img
        src="${import.meta.env.BASE_URL}aura2.png"
        class="logo"
        alt="Aura"
      />

      <div class="container">
        <h1 class="title">${this.title}</h1>
        <p class="info-text">One identity. A world of trusted connections.</p>

        <a
          href="https://brightid.gitbook.io/aura"
          target="_blank"
          rel="noreferrer"
          class="desc-btn"
        >
          <span>What is Aura?</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M15 10.8333V15.8333C15 16.2754 14.8244 16.6993 14.5118 17.0118C14.1993 17.3244 13.7754 17.5 13.3333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V6.66667C2.5 6.22464 2.67559 5.80072 2.98816 5.48816C3.30072 5.17559 3.72464 5 4.16667 5H9.16667"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12.5 2.5H17.5V7.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.33331 11.6667L17.5 2.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>`;
  }
}
