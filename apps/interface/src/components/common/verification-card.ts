import { LightElement } from '@aura/widgets/light-element';
import checkboxGreenIcon from '@/assets/icons/checkbox-green.svg';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './verification-card.css';

@customElement('verification-card')
export class VerificationCard extends LightElement {
  @property({})
  name = 'UBI Raffle Verification';

  @property({})
  status = 'In Progress';

  @property({ type: Number })
  levelRequirement = 4;

  @property({ type: Number })
  stepsCompleted = 2;

  @property({ type: Number })
  totalSteps = 4;

  @property({ type: Number })
  projectId = -1;

  render() {
    const isCompleted =
      this.totalSteps > 0 && this.stepsCompleted >= this.totalSteps;
    const progress =
      this.totalSteps > 0
        ? Math.max(
            0,
            Math.min(100, (this.stepsCompleted / this.totalSteps) * 100),
          )
        : 0;
    return html`
      <a href="/interface/projects/${this.projectId}" class="card-link">
        <div class="a-card" data-variant="default" data-interactive>
          <div class="card-header">
            <span class="card-title">${this.name}</span>
            <span
              class="a-badge"
              data-size="sm"
              data-rounded
              data-variant="${isCompleted ? 'secondary' : 'accent'}"
              style="${isCompleted ? 'color: var(--aura-success)' : ''}"
              >${this.status}</span
            >
          </div>

          <div class="level-requirement">
            <p class="a-text" data-variant="small" style="color: var(--accent)">
              Requires Level:
            </p>
            <p class="a-text" data-variant="small">
              <strong>${this.levelRequirement}</strong>
            </p>
          </div>

          ${
            !isCompleted
              ? html`
                  <div class="progress-info">
                    <p class="a-text" data-variant="small">Progress</p>
                    <p class="a-text" data-variant="small">
                      ${this.stepsCompleted}/${this.totalSteps} completed
                    </p>
                  </div>
                `
              : ''
          }
          ${
            isCompleted
              ? html`
                  <div class="verified">
                    <img
                      src="${checkboxGreenIcon}"
                      class="status-icon"
                      alt="verified"
                    />
                    <p
                      class="a-text"
                      data-variant="small"
                      style="color: var(--aura-success)"
                    >
                      Verified
                    </p>
                  </div>
                `
              : html`
                  <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%;"></div>
                  </div>
                  <span class="card-action">
                    ${this.stepsCompleted === 0 ? 'Start verification' : 'Continue'}
                  </span>
                `
          }
        </div>
      </a>
    `;
  }
}
