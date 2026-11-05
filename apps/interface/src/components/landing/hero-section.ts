import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './hero-section.css';

@customElement('hero-section')
export class HeroSectionElement extends LightElement {
  @property({ type: String })
  title = 'Aura Verified';

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
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
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
