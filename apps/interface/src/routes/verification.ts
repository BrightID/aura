import { projects } from '@/states/projects';
import { levelUpProgress, userBrightId } from '@/states/user';
import type { Project } from '@/types/projects';
import { getProjects, queryClient } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { getSubjectVerifications } from '@/utils/subject';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { pushRouter } from '@/router';

const focusedProject = signal(null as Project | null);

type Requirement = {
  reason: string;
  status: 'passed' | 'incomplete';
  level: number;
};

@customElement('verification-page')
export class VerificationPage extends SignalWatcher(LitElement) {
  @property({ type: Number })
  projectId!: number;

  @state() private auraLevel = 0;
  @state() private isLoading = true;
  @state() private loadFailed = false;

  static styles?: CSSResultGroup = css`
    :host {
      display: block;
    }

    .eyebrow {
      color: var(--muted-foreground);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 6px;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .req {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .req a-text {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .req a-badge {
      flex-shrink: 0;
    }

    .actions {
      margin-top: 8px;
    }

    .actions a-button {
      width: 100%;
    }
  `;

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
        <a-skeleton style="height: 2rem; width: 14rem"></a-skeleton>
        <a-skeleton style="height: 6rem"></a-skeleton>
        <a-skeleton style="height: 6rem"></a-skeleton>
      `;
    }

    if (this.loadFailed || !project) {
      return html`
        <a-card variant="default">
          <a-head level="2">Project unavailable</a-head>
          <a-text variant="muted">
            This project could not be loaded.
          </a-text>
          <div class="actions">
            <a-button variant="outline" @click=${() => pushRouter('/home')}>
              Back home
            </a-button>
          </div>
        </a-card>
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
        <a-head level="1">${project.name}</a-head>
        <div class="meta">
          <a-text variant="small">Required level</a-text>
          <a-badge variant="secondary" size="sm">
            Level ${project.requirementLevel}
          </a-badge>
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
      <a-card variant="default">
        <a-text variant="muted">
          Connect your identity to check your verification status.
        </a-text>
        <div class="actions">
          <a-button @click=${() => pushRouter('/login')}>Sign in</a-button>
        </div>
      </a-card>
    `;
  }

  private _renderSuccess(project: Project) {
    return html`
      <a-card variant="default">
        <a-badge variant="default" size="sm">Verified</a-badge>
        <a-head level="3">Verification complete</a-head>
        <a-text variant="muted">
          You have met the requirements to access ${project.name}.
        </a-text>
        <div class="actions">
          <a-button @click=${() => pushRouter('/home')}>Back home</a-button>
        </div>
      </a-card>
    `;
  }

  private _renderRequirements(requirements: Requirement[]) {
    const total = requirements.length;
    const done = requirements.filter((item) => item.status === 'passed').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    if (total === 0) {
      return html`
        <a-card variant="default">
          <a-text variant="muted">No requirements listed for this project.</a-text>
        </a-card>
        <div class="actions">
          <a-button variant="outline" @click=${() => pushRouter('/home')}>
            Back home
          </a-button>
        </div>
      `;
    }

    return html`
      <div>
        <a-text variant="small">Progress</a-text>
        <a-text variant="muted">${done} of ${total} complete</a-text>
        <a-progress .value=${percent}></a-progress>
      </div>
      <div class="stack">
        ${requirements.map((req) => {
          const passed = req.status === 'passed';
          return html`
            <a-card variant="default">
              <div class="req">
                <a-text>${req.reason}</a-text>
                <a-badge
                  variant=${passed ? 'default' : 'secondary'}
                  size="sm"
                >
                  ${passed ? 'Met' : 'Needed'}
                </a-badge>
              </div>
            </a-card>
          `;
        })}
      </div>
      <div class="actions">
        <a-button variant="outline" @click=${() => pushRouter('/home')}>
          Back home
        </a-button>
      </div>
    `;
  }
}
