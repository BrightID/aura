import brightIDIcon from '@/assets/icons/brightid.svg';
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('footer-section')
export class FooterSectionElement extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
    }

    .form-footer {
      color: var(--muted-foreground);
      font-size: 0.75rem;
      text-align: center;
      margin-top: 1rem;
    }

    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      margin-top: 24px;
      gap: 12px;
      flex-wrap: wrap;
      border-top: 1px solid var(--border);
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
      color: var(--foreground);
      font-size: 1rem;
      margin-left: 0.5rem;
    }

    .privacy {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }

    .privacy:hover {
      text-decoration: underline;
    }
  `;
  protected render() {
    return html` <div class="bottom-bar">
      <div class="brand">
        <a-icon src=${brightIDIcon} size="md"></a-icon>

        <span class="brand-name">BrightID</span>
      </div>
      <a href="/interface/privacy-policy" class="privacy">Privacy Policy</a>
    </div>`;
  }
}
