import brightIDIcon from '@/assets/icons/brightid.svg'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('footer-section')
export class FooterSectionElement extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      width: 100%;
    }

    .form-footer {
      color: #9ca3af;
      font-size: 0.75rem;
      text-align: center;
      margin-top: 1rem;
    }

    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      margin-top: 2rem;
      gap: 2rem;
    }

    .brand {
      display: flex;
      align-items: center;
    }

    .brand-icon {
      margin-right: 0.5rem;
      height: 2rem;
      width: 2rem;
      fill: #f97316;
    }

    .brand-name {
      font-weight: 700;
      color: #ffffff;
      font-size: 1rem;
      margin-left: 0.5rem;
    }

    .privacy {
      color: #60a5fa;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .privacy:hover {
      text-decoration: underline;
    }
  `
  protected render() {
    return html` <div class="bottom-bar">
      <div class="brand">
        <a-icon src=${brightIDIcon} size="md"></a-icon>

        <span class="brand-name">Bright ID</span>
      </div>
      <a href="/privacy-policy" class="privacy">Privacy Policy</a>
    </div>`
  }
}
