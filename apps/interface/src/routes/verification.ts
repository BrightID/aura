import { LightElement } from '@aura/widgets/light-element';
import { projects } from '@/states/projects';
import { levelUpProgress, userBrightId } from '@/states/user';
import type { Project } from '@/types/projects';
import { getProjects, queryClient } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { getSubjectVerifications } from '@/utils/subject';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { pushRouter } from '@/router';
import './verification.css';

const focusedProject = signal(null as Project | null);

type Requirement = {
  reason: string;
  status: 'passed' | 'incomplete';
  level: number;
};

@customElement('verification-page')
export class VerificationPage extends SignalWatcher(LightElement) {
  @property({ type: Number })
  projectId!: number;

  @state() private auraLevel = 0;
  @state() private isLoading = true;
  @state() private loadFailed = false;

  connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    this.isLoading = true;
    this.loadFailed = false;
    try {
      const [projectsRes, levelData, subjectData] = await Promise.all([
        queryClient.ensureQueryData({
          queryKey: ['projects'],
          queryFn: getProjects,
        }),
        userBrightId.get()
          ? getLevelupProgress({
              evaluationCategory: EvaluationCategory.SUBJECT,
            })
          : Promise.resolve(null),
        userBrightId.get()
          ? getSubjectVerifications(
              userBrightId.get(),
              EvaluationCategory.SUBJECT,
            )
          : Promise.resolve(null),
      ]);

      projects.set(projectsRes);
      focusedProject.set(
        projectsRes.find((item) => item.id === this.projectId) ?? null,
      );

      if (levelData) levelUpProgress.set(levelData.requirements);
      if (subjectData) this.auraLevel = subjectData.auraLevel ?? 0;
      if (!focusedProject.get()) this.loadFailed = true;
    } catch {
      this.loadFailed = true;
    } finally {
      this.isLoading = false;
    }
  }

  protected render() {
    const project = focusedProject.get();

    if (this.isLoading) {
      return html`
        <div class="a-skeleton" style="height: 2rem; width: 14rem"></div>
        <div class="a-skeleton" style="height: 6rem"></div>
        <div class="a-skeleton" style="height: 6rem"></div>
      `;
    }

    if (this.loadFailed || !project) {
      return html`
        <div class="a-card" data-variant="default">
          <h2 class="a-head">Project unavailable</h2>
          <p class="a-text" data-variant="muted">
            This project could not be loaded.
          </p>
          <div class="actions">
            <button
              class="a-button"
              type="button"
              data-variant="outline"
              @click=${() => pushRouter('/home')}
            >
              Back home
            </button>
          </div>
        </div>
      `;
    }

    const brightId = userBrightId.get();
    const isVerified = this.auraLevel >= project.requirementLevel;
    const activeRequirements = levelUpProgress
      .get()
      .filter((item) => item.level <= project.requirementLevel);

    return html`
      <header>
        <p class="eyebrow">Aura / Verified</p>
        <h1 class="a-head" data-level="1">${project.name}</h1>
        <div class="meta">
          <p class="a-text" data-variant="small">Required level</p>
          <span class="a-badge" data-variant="secondary" data-size="sm">
            Level ${project.requirementLevel}
          </span>
        </div>
      </header>
      ${
        !brightId
          ? this._renderAuthGate()
          : isVerified
            ? this._renderSuccess(project)
            : this._renderRequirements(activeRequirements)
      }
    `;
  }

  private _renderAuthGate() {
    return html`
      <div class="a-card" data-variant="default">
        <p class="a-text" data-variant="muted">
          Connect your identity to check your verification status.
        </p>
        <div class="actions">
          <button
            class="a-button"
            type="button"
            @click=${() => pushRouter('/login')}
          >
            Sign in
          </button>
        </div>
      </div>
    `;
  }

  private _renderSuccess(project: Project) {
    return html`
      <div class="a-card" data-variant="default">
        <span class="a-badge" data-variant="default" data-size="sm"
          >Verified</span
        >
        <h3 class="a-head" data-level="3">Verification complete</h3>
        <p class="a-text" data-variant="muted">
          You have met the requirements to access ${project.name}.
        </p>
        <div class="actions">
          <button
            class="a-button"
            type="button"
            @click=${() => pushRouter('/home')}
          >
            Back home
          </button>
        </div>
      </div>
    `;
  }

  private _renderRequirements(requirements: Requirement[]) {
    const total = requirements.length;
    const done = requirements.filter((item) => item.status === 'passed').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    if (total === 0) {
      return html`
        <div class="a-card" data-variant="default">
          <p class="a-text" data-variant="muted">
            No requirements listed for this project.
          </p>
        </div>
        <div class="actions">
          <button
            class="a-button"
            type="button"
            data-variant="outline"
            @click=${() => pushRouter('/home')}
          >
            Back home
          </button>
        </div>
      `;
    }

    return html`
      <div>
        <p class="a-text" data-variant="small">Progress</p>
        <p class="a-text" data-variant="muted">${done} of ${total} complete</p>
        <progress class="a-progress" .value=${percent} max="100"></progress>
      </div>
      <div class="stack">
        ${requirements.map((req) => {
          const passed = req.status === 'passed';
          return html`
            <div class="a-card" data-variant="default">
              <div class="req">
                <p class="a-text">${req.reason}</p>
                <span
                  class="a-badge"
                  data-variant=${passed ? 'default' : 'secondary'}
                  data-size="sm"
                >
                  ${passed ? 'Met' : 'Needed'}
                </span>
              </div>
            </div>
          `;
        })}
      </div>
      <div class="actions">
        <button
          class="a-button"
          type="button"
          data-variant="outline"
          @click=${() => pushRouter('/home')}
        >
          Back home
        </button>
      </div>
    `;
  }
}
