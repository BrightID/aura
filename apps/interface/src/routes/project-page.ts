import { LightElement } from '@aura/widgets/light-element';
import { pushRouter } from '@/router';
import { projects, trackedProject } from '@/states/projects';
import { levelUpProgress } from '@/states/user';
import { Project } from '@/types/projects';
import { getProjects, queryClient } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './project-page.css';

const focusedProject = signal(null as Project | null);
const progress = signal(0);

@customElement('project-landing')
export class ProjectLandingElement extends SignalWatcher(LightElement) {
  @property({
    type: Number,
  })
  projectId!: number;

  @state() private isLoading = true;
  @state() private loadFailed = false;

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
      return html`<div class="a-skeleton" style="height: 12rem"></div>`;
    }

    const project = focusedProject.get();
    if (this.loadFailed || !project) {
      return html`
        <div class="a-card" data-variant="default">
          <h2 class="a-head">Project unavailable</h2>
          <p class="a-text" data-variant="muted">
            That project could not be loaded.
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

    return html`
      <div class="a-card" data-variant="default">
        ${
          project.image
            ? html`<img
                src="${project.image}"
                alt="${project.name}"
                class="project-image"
              />`
            : ''
        }
        <h1 class="a-head" data-level="1">${project.name}</h1>
        <p class="description">
          ${project.description || 'No description available.'}
        </p>
        <p class="description">
          To claim your reward, complete verification in Aura.
        </p>
        <div class="actions">
          <button class="a-button" type="button" @click=${this.trackProject}>
            Continue
          </button>
        </div>
      </div>
    `;
  }
}
