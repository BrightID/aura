import { iconUrl } from '@aura/ui/icon';
import { LightElement } from '@aura/widgets/light-element';
import '@/components/common/profile-card.ts';
import { pushRouter } from '@/router.js';
import { projects, trackedProject } from '@/states/projects';
import {
  levelUpProgress,
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userProfilePicture,
} from '@/states/user';
import { getProjects, queryClient } from '@/utils/apis/index';
import { EvaluationCategory } from '@/utils/aura';
import { createBlockiesImage } from '@/utils/image.js';
import { getLevelupProgress } from '@/utils/score';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '../components/common/verification-card-skeleton.ts';
import '../components/common/verification-card.ts';
import './home.css';

const isLoading = signal(true);
const loadError = signal(false);

@customElement('my-home')
export class HomeElement extends SignalWatcher(LightElement) {
  constructor() {
    super();

    if (!userBrightId.get()) {
      pushRouter('/login');
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!userBrightId.get()) return;
    queryClient
      .ensureQueryData({
        queryKey: ['projects'],
        queryFn: getProjects,
      })
      .then((res) => {
        projects.set(res);
        loadError.set(false);
        isLoading.set(false);
      })
      .catch(() => {
        loadError.set(true);
        isLoading.set(false);
      });

    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then(
      (res) => {
        levelUpProgress.set(res.requirements);
      },
    );
  }

  protected render() {
    if (!userBrightId.get()) return html``;
    const trackP = trackedProject.get();
    return html` <div class="body">
      <header class="page-heading">
        <p class="eyebrow">Aura / Verified</p>
        <h1 class="a-head" data-level="1">Your verification</h1>
      </header>
      <div class="profile-card-wrapper">
        <profile-card
          .firstName=${userFirstName.get()}
          .lastName=${userLastName.get()}
          .email=${userEmail.get()}
          .image=${userProfilePicture.get() || createBlockiesImage(userBrightId.get())}
        ></profile-card>
      </div>

      <div class="apps-section">
        <h2 class="a-head">Your apps</h2>
        <p class="a-text section-description" data-variant="muted">
          Choose an app to view requirements and continue your verification.
        </p>

        ${
          isLoading.get()
            ? html`
                <verification-card-skeleton></verification-card-skeleton>
                <verification-card-skeleton></verification-card-skeleton>
                <verification-card-skeleton></verification-card-skeleton>
              `
            : loadError.get()
              ? html`<div class="a-card" data-variant="default">
                  <div class="empty">
                    <span
                      class="a-icon text-2xl"
                      aria-hidden="true"
                      style="--icon-url: url('${iconUrl('triangle-alert')}')"
                    ></span>
                    <p class="a-text" data-variant="muted">
                      Could not load apps.
                    </p>
                  </div>
                </div>`
              : (trackP ? [trackP] : projects.get()).length === 0
                ? html`<div class="a-card" data-variant="default">
                    <div class="empty">
                      <span
                        class="a-icon text-2xl"
                        aria-hidden="true"
                        style="--icon-url: url('${iconUrl('inbox')}')"
                      ></span>
                      <p class="a-text" data-variant="muted">
                        No apps to verify yet.
                      </p>
                    </div>
                  </div>`
                : map(trackP ? [trackP] : projects.get(), (project) => {
                    const totalSteps = levelUpProgress
                      .get()
                      .filter((item) => item.level <= project.requirementLevel);

                    const stepsCompleted = totalSteps.filter(
                      (item) => item.status === 'passed',
                    ).length;

                    return html`
                      <verification-card
                        .status=${
                          stepsCompleted === 0
                            ? 'Not Started'
                            : stepsCompleted < totalSteps.length
                              ? 'In progress'
                              : 'Completed'
                        }
                        .name=${project.name}
                        .levelRequirement=${project.requirementLevel}
                        .stepsCompleted="${stepsCompleted}"
                        .totalSteps="${totalSteps.length}"
                        .projectId=${project.id}
                      ></verification-card>
                    `;
                  })
        }
      </div>
    </div>`;
  }
}
