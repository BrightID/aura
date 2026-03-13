import checkboxGreenIcon from '@/assets/icons/checkbox-green.svg'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('verification-card')
export class VerificationCard extends LitElement {
  @property({})
  name = 'UBI Raffle Verification'

  @property({})
  status = 'In Progress'

  @property({ type: Number })
  levelRequirement = 4

  @property({ type: Number })
  stepsCompleted = 2

  @property({ type: Number })
  totalSteps = 4

  @property({ type: Number })
  projectId = -1

  static styles = css`
    .card-link {
      color: inherit;
      text-decoration: none;
      display: block;
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .level-requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: color-mix(in oklch, var(--border) 50%, transparent);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .progress {
      height: 100%;
      background-color: var(--primary);
      border-radius: 9999px;
    }

    .verified {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .status-icon {
      width: 30px;
      height: 30px;
    }

    a-button {
      width: 100%;
      display: block;
    }
  `

  render() {
    const isCompleted = this.stepsCompleted === this.totalSteps
    return html`
      <a href="/projects/${this.projectId}" class="card-link">
        <a-card>
          <div class="card-header">
            <span class="card-title">${this.name}</span>
            <a-badge
              size="sm"
              rounded
              variant="${isCompleted ? 'secondary' : 'accent'}"
              style="${isCompleted ? 'color: var(--aura-success)' : ''}"
            >${this.status}</a-badge>
          </div>

          <div class="level-requirement">
            <a-text variant="small" style="color: var(--accent)">Requires Level:</a-text>
            <a-text variant="small"><strong>${this.levelRequirement}</strong></a-text>
          </div>

          ${!isCompleted ? html`
            <div class="progress-info">
              <a-text variant="small">Progress</a-text>
              <a-text variant="small">${this.stepsCompleted}/${this.totalSteps} completed</a-text>
            </div>
          ` : ''}

          ${isCompleted
            ? html`
                <div class="verified">
                  <img src="${checkboxGreenIcon}" class="status-icon" alt="verified" />
                  <a-text variant="small" style="color: var(--aura-success)">Verified</a-text>
                </div>
              `
            : html`
                <div class="progress-bar">
                  <div class="progress" style="width: ${(this.stepsCompleted / this.totalSteps) * 100}%;"></div>
                </div>
                <a-button size="sm" style="width: 100%">
                  ${this.stepsCompleted === 0 ? 'Start Now!' : 'Continue'}
                </a-button>
              `}
        </a-card>
      </a>
    `
  }
}
