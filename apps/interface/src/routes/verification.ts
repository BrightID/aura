import { projects } from '@/states/projects'
import { levelUpProgress } from '@/states/user'
import type { Project } from '@/types/projects'
import { getProjects, queryClient } from '@/utils/apis'
import { EvaluationCategory } from '@/utils/aura'
import { getLevelupProgress } from '@/utils/score'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const focusedProject = signal(null as Project | null)
const isPassed = signal(false)

@customElement('verification-page')
export class VerificationPage extends SignalWatcher(LitElement) {
  @property({ type: Number })
  projectId!: number

  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      --background: #0d0d1b;
      --surface: #161b22;
      --border: #30363d;
      --foreground: #f0f6fc;
      --muted: #8b949e;
      --accent: #1f6feb;
      --success: #238636;
      --warning: #9e6a03;
    }

    .container {
      min-height: 100vh;
      background-color: var(--background);
      color: var(--foreground);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
        sans-serif;
      padding: 32px 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header Section */
    .header {
      margin-bottom: 40px;
      text-align: left;
    }

    .project-name {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .project-meta {
      font-size: 16px;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .level-badge {
      background: var(--border);
      color: var(--foreground);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    /* List Section */
    .requirements-title {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 16px;
    }

    .requirements-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .req-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      font-size: small;
      transition: border-color 0.2s;
    }

    .req-card.passed {
      border-color: rgba(35, 134, 54, 0.4);
    }

    .status-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-indicator.passed {
      background-color: var(--success);
      box-shadow: 0 0 8px rgba(35, 134, 54, 0.4);
    }

    /* Checkmark shape */
    .status-indicator.passed::after {
      content: '';
      width: 5px;
      height: 9px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }

    .status-indicator.pending {
      border: 2px solid var(--muted);
      background-color: transparent;
    }

    .req-content {
      flex: 1;
      text-align: left;
    }

    .req-reason {
      font-size: 14px;
      font-weight: 400;
      margin: 0 0 4px 0;
      color: var(--foreground);
    }

    .req-status-text {
      font-size: 13px;
      color: var(--muted);
    }

    /* Success State */
    .success-container {
      text-align: center;
      padding: 40px;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--success);
    }

    .success-title {
      color: #7ee787;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    /* Navigation */
    .actions {
      margin-top: 40px;
      display: flex;
      justify-content: center;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      background-color: var(--accent);
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: background-color 0.2s;
      width: 100%;
    }

    .back-btn:hover {
      background-color: #1158c7;
    }

    .loading {
      color: var(--muted);
      text-align: center;
      margin-top: 40px;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()

    queryClient
      .ensureQueryData({
        queryKey: ['projects'],
        queryFn: getProjects
      })
      .then((res) => {
        projects.set(res)
        focusedProject.set(res.find((item) => item.id === this.projectId) ?? null)
      })

    getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }).then((res) => {
      isPassed.set(res.isUnlocked)
      levelUpProgress.set(res.requirements)
    })
  }

  protected render() {
    const project = focusedProject.get()
    const requirements = levelUpProgress.get()

    // Logic from original: if no items are below the required level, user is verified
    const isVerified =
      project && requirements.filter((item) => item.level <= project.requirementLevel).length === 0
    const activeRequirements = project
      ? requirements.filter((item) => item.level >= project.requirementLevel)
      : []

    if (!project) {
      return html`<div class="container">
        <div class="loading">Loading project details...</div>
      </div>`
    }

    return html`
      <div class="container">
        <div class="header">
          <h1 class="project-name">${project.name}</h1>
          <div class="project-meta">
            <span>Required Verification:</span>
            <span class="level-badge">Level ${project.requirementLevel}</span>
          </div>
        </div>

        ${isVerified
          ? html`
              <div class="success-container">
                <div class="success-title">Verification Complete</div>
                <p style="color: var(--muted); line-height: 1.5;">
                  You have met all the necessary requirements to access
                  <strong>${project.name}</strong>.
                </p>
                <div class="actions">
                  <a href="/home" class="back-btn">Continue to App</a>
                </div>
              </div>
            `
          : html`
              <div>
                <div class="requirements-title">Pending Actions</div>

                <div class="requirements-list">
                  ${activeRequirements.map((req) => {
                    const passed = req.status === 'passed'
                    return html`
                      <div class="req-card ${passed ? 'passed' : ''}">
                        <div class="status-indicator ${passed ? 'passed' : 'pending'}"></div>

                        <div class="req-content">
                          <h3 class="req-reason">${req.reason}</h3>
                          <div class="req-status-text">
                            ${passed ? 'Requirement Met' : 'Action Required'}
                          </div>
                        </div>
                      </div>
                    `
                  })}
                </div>

                <div class="actions">
                  <a
                    href="/home"
                    class="back-btn"
                    style="background-color: var(--surface); border: 1px solid var(--border);"
                  >
                    Back to Overview
                  </a>
                </div>
              </div>
            `}
      </div>
    `
  }
}
