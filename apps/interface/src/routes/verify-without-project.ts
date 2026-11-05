import { LightElement } from '@aura/widgets/light-element';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@/components/common/profile-card';
import '@/routes/brightid';
import '@/routes/index';

import {
  levelUpProgress,
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userProfilePicture,
} from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import './verify-without-project.css';

const isPassed = signal(false);

const isBrightIDSection = signal(false);

@customElement('verify-without-project-page')
export class VerifyWithoutProjectPageElement extends SignalWatcher(
  LightElement,
) {
  @property({
    type: Number,
  })
  level: number = 1;

  @property({
    type: String,
  })
  projectName!: string;

  @property({
    type: String,
  })
  description?: string;

  @property({
    type: String,
  })
  image?: string;

  previousBrightID = signal(userBrightId.get());

  connectedCallback(): void {
    super.connectedCallback();

    window.parent.postMessage(
      JSON.stringify({ type: 'app-ready', app: 'aura' }),
      '*',
    );

    this.updateLevelUpProgress();
  }

  protected override updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (userBrightId.get() === this.previousBrightID.get()) return;

    this.updateLevelUpProgress();
    this.previousBrightID.set(userBrightId.get());
  }

  private updateLevelUpProgress() {
    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then(
      (res) => {
        const stepsToComplete = res.requirements.filter(
          (item) => item.level === this.level,
        );

        const isPassedRequirements =
          stepsToComplete.filter((item) => item.status === 'passed').length ===
          0;
        isPassed.set(isPassedRequirements);
        levelUpProgress.set(stepsToComplete);

        if (
          stepsToComplete.filter((c) => c.status === 'incomplete').length === 0
        ) {
          this.onUserVerified();
        }
      },
    );
  }

  protected onLoginWithBrightID() {
    isBrightIDSection.set(true);
  }

  protected offLoginWithBrightID() {
    isBrightIDSection.set(false);
  }

  protected onUserVerified() {
    window.parent.postMessage(
      '{"type": "verification-success", "app": "aura"}',
      '*',
    );
  }

  protected render() {
    if (!userBrightId.get()) {
      if (isBrightIDSection.get()) {
        return html`
          <div class="mt-5"></div>
          <brightid-login
            @offBrightIDSection=${this.offLoginWithBrightID}
            withoutTitle
          ></brightid-login>
        `;
      }

      return html`
        <h1 class="title">${this.projectName}</h1>

        ${
          this.image
            ? html`
                <div class="image-container">
                  <img src=${this.image} alt="Project image" class="image" />
                </div>
              `
            : ''
        }

        <div class="level-requirement">
          <span class="highlight-text">Requires Level: </span>
          <span>${this.level}</span>
        </div>

        <home-page
          @onBrightLogin=${this.onLoginWithBrightID}
          withoutTitle
        ></home-page>
      `;
    }

    return html`
      <h1 class="title">${this.projectName}</h1>

      <div class="image-container">
        ${
          this.image
            ? html`
                <div class="image-container">
                  <img src=${this.image} alt="Project image" class="image" />
                </div>
              `
            : ''
        }

        <div class="level-requirement">
          <span class="highlight-text">Requires Level: </span>
          <span>${this.level}</span>
        </div>

        ${
          levelUpProgress.get().filter((item) => item.status === 'incomplete')
            .length === 0
            ? html` <div
                style="text-align:center;color:lightgreen;font-size:18px;font-weight:600;"
              >
                🎉 You are already verified!<br />
                <span style="color:#dadada;font-size:14px;font-weight:400;">
                  You can continue your progress in the app.
                </span>
                <br />
              </div>`
            : html`
                <profile-card
                  .firstName=${userFirstName.get()}
                  .lastName=${userLastName.get()}
                  .email=${userEmail.get()}
                  .image=${userProfilePicture.get()}
                ></profile-card>
                <div class="timeline">
                  ${levelUpProgress
                    .get()
                    .filter((item) => item.level >= this.level)
                    .map(
                      (req) => html`
                        <div class="step">
                          <div class="step-content">
                            <h5 class="step-title">${req.reason}</h5>
                            <p class="step-description">
                              Status:
                              <span
                                style="color:${req.status === 'passed' ? 'lightgreen' : 'orange'}"
                              >
                                ${req.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      `,
                    )}
                </div>
                <a
                  target="_blank"
                  class="highlight-text"
                  href="/interface/login"
                  >Get Verified Here</a
                >
              `
        }
      </div>
    `;
  }
}
