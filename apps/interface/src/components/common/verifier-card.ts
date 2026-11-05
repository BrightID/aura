import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg';
import './verifier-card.css';

@customElement('verifier-card')
export class VerifierCard extends LightElement {
  @property({ type: String })
  verifierName = 'Ali Maktabi';

  @property({ type: String })
  verifierEmail = 'maktabi876@gmail.com';

  @property({ type: String })
  verifierPicture = '/images/profile-photo.png?height=64&width=64';

  @property({ type: Number })
  verifierLevel = 3;

  @property({ type: Number })
  progressPercent = 30;

  @property({ type: Number })
  evaluationScore = 0;

  @property({ type: String })
  evaluationText = '';

  @property({ type: String })
  evaluationIcon = thumbsUpGreen;

  @property({ type: String })
  evaluationNote = '';

  protected render() {
    return html`
      <div class="a-card" data-variant="default">
        <div class="verifier-header">
          <div class="verifier-picture">
            <img src="${this.verifierPicture}" alt="verifier picture" />
          </div>
          <div class="verifier-info">
            <h5
              class="a-head"
              data-level="5"
              style="margin: 0; font-size: 0.9375rem"
              title=${this.verifierName}
            >
              <span class="ellipsis">${this.verifierName}</span>
            </h5>
            ${
              this.verifierEmail
                ? html`<p
                    class="a-text"
                    data-variant="muted"
                    style="display: block; margin-top: 2px"
                    title=${this.verifierEmail}
                  >
                    <span class="ellipsis">${this.verifierEmail}</span>
                  </p>`
                : ''
            }
          </div>
        </div>

        <div class="progress-bar">
          <div
            class="progress"
            style="width: ${Math.max(0, Math.min(100, this.progressPercent || 0))}%;"
          ></div>
        </div>

        <div class="evaluation">
          <span class="a-badge" data-variant="secondary" data-size="xs"
            >Level ${this.verifierLevel}</span
          >
          ${
            this.evaluationText
              ? html`
                  <img
                    width="14"
                    height="14"
                    src="${this.evaluationIcon}"
                    alt=""
                  />
                  <p
                    class="a-text"
                    data-variant="small"
                    style="color: var(--aura-success)"
                  >
                    +${this.evaluationScore} ${this.evaluationText}
                  </p>
                `
              : ''
          }
          ${
            this.evaluationNote
              ? html`<span class="evaluation-note"
                  >${this.evaluationNote}</span
                >`
              : ''
          }
        </div>
      </div>
    `;
  }
}
