import '@/components/common/profile-card'
import { pushRouter } from '@/router'
import { projects, trackedProject } from '@/states/projects'
import { levelUpProgress } from '@/states/user'
import { Project } from '@/types/projects'
import { getProjects, queryClient } from '@/utils/apis'
import { EvaluationCategory } from '@/utils/aura'
import { getLevelupProgress } from '@/utils/score'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const focusedProject = signal(null as Project | null)
const progress = signal(0)

@customElement('project-landing')
export class ProjectLandingElement extends SignalWatcher(LitElement) {
  @property({
    type: Number
  })
  projectId!: number

  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    .container {
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .project-image {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin-bottom: 24px;
      transition: transform 0.3s ease;
    }

    .project-image:hover {
      transform: scale(1.02);
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .description {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .info-section {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 24px;
      padding: 16px;
      background: white;
      border-radius: 12px;
    }

    .info-item {
      flex: 1;
      min-width: 200px;
    }

    .info-item label {
      font-weight: 600;
      color: #2d3748;
      display: block;
      margin-bottom: 8px;
    }

    .info-item span {
      color: #4a5568;
    }

    .continue-button {
      background: linear-gradient(90deg, #007bff 0%, #00c4b4 100%);
      color: white;
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .continue-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
    }

    .continue-button svg {
      width: 20px;
      height: 20px;
    }

    .progress-bar {
      margin-top: 24px;
      background: #e2e8f0;
      border-radius: 8px;
      height: 8px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #48bb78;
      transition: width 0.5s ease;
    }

    @media (max-width: 600px) {
      .container {
        padding: 16px;
      }

      h1 {
        font-size: 24px;
      }

      .description {
        font-size: 14px;
      }

      .info-section {
        flex-direction: column;
      }
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    const fetchData = queryClient
      .ensureQueryData({
        queryKey: ['projects'],
        queryFn: getProjects
      })
      .then((res) => {
        projects.set(res)
        focusedProject.set(res.find((item) => item.id === this.projectId) ?? null)
      })

    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then((res) => {
      progress.set(res.percent)
      levelUpProgress.set(res.requirements)
    })
  }

  protected trackProject() {
    trackedProject.set(focusedProject.get())
    pushRouter(`/`)
  }

  protected render() {
    const project = focusedProject.get()
    if (!project) return html`<p>Loading...</p>`

    return html`
      <div class="container">
        ${project.image
          ? html`<img src="${project.image}" alt="${project.name}" class="project-image" />`
          : ''}
        <h1>${project.name} Verification</h1>
        <p class="description">${project.description || 'No description available.'}</p>

        <p class="description">
          To claim your reward, complete the verification process through Aura.
        </p>
        <!-- <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress.get()}%"></div>
        </div> -->
        <button class="continue-button" @click=${this.trackProject}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Continue to Verification
        </button>
      </div>
    `
  }
}
