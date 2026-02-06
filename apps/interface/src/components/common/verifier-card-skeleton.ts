import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('verifier-card-skeleton')
export class VerifierCardSkeleton extends LitElement {
  static styles = css`
    .verifier-card {
      background-image: linear-gradient(
        to top right,
        rgba(46, 51, 90, 0.26),
        rgba(28, 27, 51, 0.26) 100%
      );
      backdrop-filter: blur(21px);
      border-radius: 24px;
      padding: 18px 20px 5px 18px;
      border-top: 1px solid #ffffff30;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
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
    .verifier-header {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 16px;
    }
    .picture-skeleton {
      width: 64px;
      height: 64px;
      border-radius: 6px;
    }
    .info-skeleton {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 2px;
    }
    .name-skeleton {
      width: 90px;
      height: 16px;
    }
    .email-skeleton {
      width: 120px;
      height: 12px;
    }
    .level-skeleton {
      width: 70px;
      height: 14px;
      margin-top: 8px;
    }
    .progress-bar {
      width: 100%;
      height: 12px;
      background-color: #313042;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-skeleton {
      height: 100%;
      width: 30%;
      border-radius: 9999px;
    }
    .evaluation-skeleton {
      width: 80px;
      height: 16px;
      margin: 10px 0 4px 0;
    }
    .note-skeleton {
      width: 60px;
      height: 10px;
      border-radius: 4px;
    }
    section {
      margin-left: auto;
      width: 117.975px;
    }
  `

  render() {
    return html`
      <div class="verifier-card">
        <div class="verifier-header">
          <div class="skeleton picture-skeleton"></div>
          <div class="info-skeleton">
            <div class="skeleton name-skeleton"></div>
            <div class="skeleton email-skeleton"></div>
          </div>
          <div class="skeleton level-skeleton"></div>
        </div>
        <div class="progress-bar">
          <div class="skeleton progress-skeleton"></div>
        </div>
        <section>
          <div class="skeleton evaluation-skeleton"></div>
          <div class="skeleton note-skeleton"></div>
        </section>
      </div>
    `
  }
}
