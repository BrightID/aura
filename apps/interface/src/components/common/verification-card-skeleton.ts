import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('verification-card-skeleton')
export class VerificationCardSkeleton extends LitElement {
  static styles = css`
    .verification-card {
      color: inherit;
      text-decoration: none;
      background: #ffffff14;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(229, 231, 235, 0.21);
      border-radius: 12px;
      padding: 14px 14px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
    }
    .skeleton {
      background: linear-gradient(90deg, #23244a 25%, #2a2b54 50%, #23244a 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.2s infinite linear;
      border-radius: 6px;
    }
    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
    .header-skeleton {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .title-skeleton {
      width: 120px;
      height: 18px;
    }
    .status-skeleton {
      width: 70px;
      height: 20px;
      border-radius: 9999px;
    }
    .level-skeleton {
      width: 90px;
      height: 16px;
      margin-bottom: 10px;
    }
    .progress-info-skeleton {
      width: 100%;
      height: 14px;
      margin-bottom: 8px;
    }
    .progress-bar-skeleton {
      width: 100%;
      height: 12px;
      border-radius: 2px;
      margin-bottom: 8px;
    }
    .button-skeleton {
      width: 100px;
      height: 32px;
      border-radius: 12px;
      margin: 0 auto;
    }
  `

  render() {
    return html`
      <div class="verification-card">
        <div class="header-skeleton">
          <div class="skeleton title-skeleton"></div>
          <div class="skeleton status-skeleton"></div>
        </div>
        <div class="skeleton level-skeleton"></div>
        <div class="skeleton progress-info-skeleton"></div>
        <div class="skeleton progress-bar-skeleton"></div>
        <div class="skeleton button-skeleton"></div>
      </div>
    `
  }
}
