import { LightElement } from '@aura/widgets/light-element';
import { projects } from '@/states/projects';
import {
  levelUpProgress,
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userProfilePicture,
} from '@/states/user';
import { Project } from '@/types/projects';
import { getProjects, queryClient } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@/components/common/profile-card';
import '@/routes/brightid';
import '@/routes/index';
import './project-verification.css';

const focusedProject = signal(null as Project | null);
const isPassed = signal(false);

const isBrightIDSection = signal(false);

@customElement('project-verification')
export class ProjectVerificationElement extends SignalWatcher(LightElement) {
  @property({
    type: Number,
  })
  projectId!: number;

  previousBrightID = signal(userBrightId.get());

  connectedCallback(): void {
    super.connectedCallback();

    queryClient
      .ensureQueryData({
        queryKey: ['projects'],
        queryFn: getProjects,
      })
      .then((res) => {
        projects.set(res);
        focusedProject.set(
          res.find((item) => item.id === this.projectId) ?? null,
        );
      })
      .then(() => {
        this.updateLevelUpProgress();
      });
  }

  protected onWindowMessage(auraTab: Window, e: MessageEvent<any>) {
    const message = e.data;

    if (e.origin !== window.location.origin) return;

    try {
      const data = JSON.parse(message);

      if (data.app !== 'aura') return;

      switch (data.type) {
        case 'app-ready':
          auraTab?.postMessage(
            JSON.stringify({
              type: 'signin-sync',
              data: {
                brightId: userBrightId.get(),
                email: userEmail.get(),
                firstName: userFirstName.get(),
                lastName: userLastName.get(),
                picture: userProfilePicture.get(),
              },
            }),
          );
          return;
      }
    } catch {
      return;
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (userBrightId.get() === this.previousBrightID.get()) return;

    this.updateLevelUpProgress();
    this.previousBrightID.set(userBrightId.get());
  }

  protected onGoToApp() {
    const auraTab = window.open('/interface/login');

    auraTab?.addEventListener(
      'message',
      this.onWindowMessage.bind(this, auraTab),
    );
  }

  private updateLevelUpProgress() {
    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then(
      (res) => {
        const stepsToComplete = res.requirements.filter(
          (item) => item.level === focusedProject.get()?.requirementLevel,
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
        <h1 class="title">${focusedProject.get()?.name}</h1>

        ${
          focusedProject.get()?.image
            ? html`
                <div class="image-container">
                  <img
                    src=${focusedProject.get()!.image!}
                    alt="Project image"
                    class="image"
                  />
                </div>
              `
            : ''
        }

        <div class="level-requirement">
          <span class="highlight-text">Requires Level: </span>
          <span>${focusedProject.get()?.requirementLevel}</span>
        </div>

        <home-page
          @onBrightLogin=${this.onLoginWithBrightID}
          withoutTitle
        ></home-page>
      `;
    }

    return html`
      <h1 class="title">${focusedProject.get()?.name}</h1>

      ${
        focusedProject.get()?.image
          ? html` <div class="image-container">
              <img
                src=${focusedProject.get()!.image!}
                alt="Project image"
                class="image"
              />
            </div>`
          : ''
      }

      <div class="level-requirement">
        <span class="highlight-text">Requires Level: </span>
        <span>${focusedProject.get()?.requirementLevel}</span>
      </div>

      ${
        !focusedProject.get()
          ? 'Loading ...'
          : levelUpProgress.get().filter((item) => item.status === 'incomplete')
                .length === 0
            ? html` <div
                style="text-align:center;color:lightgreen;font-size:18px;font-weight:600;"
              >
                🎉 You are already verified!<br />
                <span style="color:#dadada;font-size:14px;font-weight:400;">
                  You can continue your progress in the app.
                </span>
                <br />
                <!-- <a href="/home" class="back-btn">Back to Main App</a> -->
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
                    .filter(
                      (item) =>
                        item.level >= focusedProject.get()!.requirementLevel,
                    )
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

                  <button @click=${this.onGoToApp} class="highlight-text more">
                    Get Verified Here
                  </button>
                </div>
              `
      }
    `;
  }
}
