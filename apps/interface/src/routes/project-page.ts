import { pushRouter } from '@/router';
import { projects, trackedProject } from '@/states/projects';
import { levelUpProgress } from '@/states/user';
import { Project } from '@/types/projects';
import { getProjects, queryClient } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const focusedProject = signal(null as Project | null);
const progress = signal(0);

@customElement('project-landing')
export class ProjectLandingElement extends SignalWatcher(LitElement) {
  @property({
    type: Number,
  })
  projectId!: number;

  @state() private isLoading = true;
  @state() private loadFailed = false;

  static styles?: CSSResultGroup = css`
    :host {
      display: block;
    }

    .project-image {
      width: 100%;
      height: auto;
      border-radius: var(--radius);
      margin-bottom: 16px;
    }

    .description {
      color: var(--muted-foreground);
      line-height: 1.5;
      margin: 8px 0 0;
      overflow-wrap: anywhere;
    }

    .actions {
      margin-top: 20px;
    }

    .actions a-button {
      width: 100%;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.isLoading = true;
    this.loadFailed = false;
    queryClient
      .ensureQueryData({
        queryKey: ['projects'],
        queryFn: getProjects,
      })
      .then((res) => {
        projects.set(res);
        const match = res.find((item) => item.id === this.projectId) ?? null;
        focusedProject.set(match);
        if (!match) this.loadFailed = true;
      })
      .catch(() => {
        this.loadFailed = true;
      })
      .finally(() => {
        this.isLoading = false;
      });

    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then(
      (res) => {
        progress.set(res.percent);
        levelUpProgress.set(res.requirements);
      },
    );
  }

  protected trackProject() {
    trackedProject.set(focusedProject.get());
    pushRouter('/home');
  }

  protected render() {
    if (this.isLoading) {
      return html`<a-skeleton style="height: 12rem"></a-skeleton>`;
    }

    const project = focusedProject.get();
    if (this.loadFailed || !project) {
      return html`
        <a-card variant="default">
          <a-head level="2">Project unavailable</a-head>
          <a-text variant="muted">That project could not be loaded.</a-text>
          <div class="actions">
            <a-button variant="outline" @click=${() => pushRouter('/home')}>
              Back home
            </a-button>
          </div>
        </a-card>
      `;
    }

    return html`
      <a-card variant="default">
        ${
          project.image
            ? html`<img
                src="${project.image}"
                alt="${project.name}"
                class="project-image"
              />`
            : ''
        }
        <a-head level="1">${project.name}</a-head>
        <p class="description">
          ${project.description || 'No description available.'}
        </p>
        <p class="description">
          To claim your reward, complete verification in Aura.
        </p>
        <div class="actions">
          <a-button @click=${this.trackProject}>Continue</a-button>
        </div>
      </a-card>
    `;
  }
}
