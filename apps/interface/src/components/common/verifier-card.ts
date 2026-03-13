import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg'

@customElement('verifier-card')
export class VerifierCard extends LitElement {
  @property({ type: String })
  verifierName = 'Ali Maktabi'

  @property({ type: String })
  verifierEmail = 'maktabi876@gmail.com'

  @property({ type: String })
  verifierPicture = '/images/profile-photo.png?height=64&width=64'

  @property({ type: Number })
  verifierLevel = 3

  @property({ type: Number })
  progressPercent = 30

  @property({ type: Number })
  evaluationScore = 4

  @property({ type: String })
  evaluationText = 'Very High'

  @property({ type: String })
  evaluationIcon = thumbsUpGreen

  @property({ type: String })
  evaluationNote = 'Evaluated you'

  static styles = css`
    .verifier-header {
      display: flex;
      align-items: flex-start;
      text-align: left;
      gap: 16px;
      margin-bottom: 16px;
    }

    .verifier-picture {
      width: 52px;
      height: 52px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .verifier-picture img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .verifier-info {
      flex: 1 1 auto;
      min-width: 0;
    }

    .verifier-level {
      margin-left: auto;
      white-space: nowrap;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: color-mix(in oklch, var(--border) 50%, transparent);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: var(--primary);
      border-radius: 9999px;
    }

    .evaluation {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }

    .evaluation-note {
      font-size: 10px;
      color: var(--muted-foreground);
    }
  `

  protected render() {
    return html`
      <a-card variant="glass">
        <div class="verifier-header">
          <div class="verifier-picture">
            <img src="${this.verifierPicture}" alt="verifier picture" />
          </div>
          <div class="verifier-info">
            <a-head level="5" style="margin: 0; font-size: 0.9375rem">${this.verifierName}</a-head>
            ${this.verifierEmail
              ? html`<a-text variant="muted" style="display: block; margin-top: 2px">${this.verifierEmail}</a-text>`
              : ''}
          </div>
          <div class="verifier-level">
            <a-badge variant="secondary" size="xs">Level ${this.verifierLevel}</a-badge>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress" style="width: ${this.progressPercent}%;"></div>
        </div>

        <div class="evaluation">
          <img width="14" height="14" src="${this.evaluationIcon}" alt="evaluation" />
          <a-text variant="small" style="color: var(--aura-success)">
            +${this.evaluationScore} ${this.evaluationText}
          </a-text>
          <span class="evaluation-note">${this.evaluationNote}</span>
        </div>
      </a-card>
    `
  }
}
