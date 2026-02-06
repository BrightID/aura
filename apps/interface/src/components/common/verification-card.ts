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

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .status {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: smaller;
    }

    .status.in-progress {
      background-color: #0093b1;
      color: white;
    }

    .status.completed {
      background-color: rgba(5, 150, 105, 0.2);
      color: #10b981;
    }

    .level-requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .level-requirement span:first-child {
      color: #15c8ec;
    }

    .level-requirement span:last-child {
      font-weight: 700;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-info .completed {
      color: #059669;
      border-radius: 9999px;
      border: 0px solid #e5e7eb;
      background: #98bfab;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background-color: #313042;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress {
      border-radius: 2px;
      height: 100%;
      background-color: #5500ff;
      border-radius: 9999px;
    }

    .continue-button {
      background-color: #2f6de9;
      color: white;
      padding: 10px;
      font-family: inherit;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 300;
      border: none;
      text-align: center;
    }

    .verified {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .checkmark {
      background-color: #10b981;
      border-radius: 50%;
      padding: 12px;
      margin-bottom: 16px;
    }

    .checkmark svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .verified-date {
      color: #747474;
    }
    .status-icon {
      width: 30px;
      height: 30px;
      box-sizing: border-box;
      margin: auto;
      margin-bottom: -14px;
    }
    .status-text {
      color: #4b5563;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  `

  render() {
    return html`
      <a href="/projects/${this.projectId}" class="verification-card">
        <div class="card-header">
          <h3>${this.name}</h3>
          <div
            class="status ${this.stepsCompleted === this.totalSteps ? 'completed' : 'in-progress'}"
          >
            ${this.status}
          </div>
        </div>
        <div class="level-requirement">
          <span>Requires Level:</span>
          <span>${this.levelRequirement}</span>
        </div>

        ${this.stepsCompleted < this.totalSteps
          ? html`
              <div class="progress-info">
                <span>Progress</span>
                <span>${this.stepsCompleted}/${this.totalSteps} completed</span>
              </div>
            `
          : ''}
        ${this.stepsCompleted === this.totalSteps
          ? html`
              <img src="${checkboxGreenIcon}" class="status-icon" />
              <p class="status-text">Verified</p>
            `
          : html`
              <div class="progress-bar">
                <div
                  class="progress"
                  style="width: ${(this.stepsCompleted / this.totalSteps) * 100}%;"
                ></div>
              </div>
              <button class="continue-button">
                ${this.stepsCompleted === 0 ? 'Start Now!' : 'Continue'}
              </button>
            `}
      </a>
    `
  }
}
