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
import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '../components/common/verification-card-skeleton.ts';
import '../components/common/verification-card.ts';

const isLoading = signal(true);
const loadError = signal(false);

@customElement('my-home')
export class HomeElement extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    .profile-card-wrapper {
      position: relative;
      margin-bottom: 32px;
    }

    .apps-section {
      text-align: left;
      margin-bottom: 32px;
    }

    .apps-section a-head {
      margin-bottom: 8px;
    }

    .page-heading {
      text-align: left;
      margin-bottom: 8px;
    }
    .eyebrow {
      color: var(--muted-foreground);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 6px;
    }
    .section-description {
      margin: 0 0 20px;
    }
    .empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 24px 0;
      color: var(--muted-foreground);
    }
  `;

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
        <a-head level="1">Your verification</a-head>
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
        <a-head level="2">Your apps</a-head>
        <a-text variant="muted" class="section-description">
          Choose an app to view requirements and continue your verification.
        </a-text>

        ${
          isLoading.get()
            ? html`
                <verification-card-skeleton></verification-card-skeleton>
                <verification-card-skeleton></verification-card-skeleton>
                <verification-card-skeleton></verification-card-skeleton>
              `
            : loadError.get()
              ? html`<a-card variant="default">
                  <div class="empty">
                    <a-icon name="triangle-alert" size="md"></a-icon>
                    <a-text variant="muted">Could not load apps.</a-text>
                  </div>
                </a-card>`
              : (trackP ? [trackP] : projects.get()).length === 0
                ? html`<a-card variant="default">
                    <div class="empty">
                      <a-icon name="inbox" size="md"></a-icon>
                      <a-text variant="muted">No apps to verify yet.</a-text>
                    </div>
                  </a-card>`
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
