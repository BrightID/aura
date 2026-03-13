import { projects } from '@/states/projects'
import { levelUpProgress, userBrightId } from '@/states/user'
import type { Project } from '@/types/projects'
import { getProjects, queryClient } from '@/utils/apis'
import { EvaluationCategory } from '@/utils/aura'
import { getLevelupProgress } from '@/utils/score'
import { getSubjectVerifications } from '@/utils/subject'
import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

const focusedProject = signal(null as Project | null)

@customElement('verification-page')
export class VerificationPage extends SignalWatcher(LitElement) {
  @property({ type: Number })
  projectId!: number

  @state() private auraLevel = 0
  @state() private isLoading = true

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
      color: var(--foreground);
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 32px 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      max-width: 600px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 32px;
      text-align: left;
    }

    .project-name {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .project-meta {
      font-size: 14px;
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

    .requirements-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 12px;
    }

    .requirements-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .req-card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .req-card.passed {
      border-color: rgba(35, 134, 54, 0.4);
    }

    .status-indicator {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-indicator.passed {
      background-color: var(--success);
      box-shadow: 0 0 6px rgba(35, 134, 54, 0.4);
    }

    .status-indicator.passed::after {
      content: '';
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }

    .status-indicator.pending {
      border: 2px solid var(--muted);
      background-color: transparent;
    }

    .req-content { flex: 1; text-align: left; }

    .req-reason {
      font-size: 13px;
      font-weight: 400;
      margin: 0 0 2px;
      color: var(--foreground);
    }

    .req-status-text {
      font-size: 12px;
      color: var(--muted);
    }

    /* Success */
    .success-container {
      text-align: center;
      padding: 32px 24px;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--success);
    }

    .success-title {
      color: #7ee787;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 10px;
    }

    /* Auth gate */
    .auth-gate {
      text-align: center;
      padding: 32px 24px;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .auth-gate p {
      color: var(--muted);
      font-size: 14px;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    /* Actions */
    .actions {
      margin-top: 32px;
      display: flex;
      justify-content: center;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 22px;
      background-color: var(--accent);
      color: white;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background-color 0.2s;
      width: 100%;
      box-sizing: border-box;
    }

    .back-btn:hover {
      background-color: #1158c7;
    }

    .back-btn.secondary {
      background-color: var(--surface);
      border: 1px solid var(--border);
    }

    .back-btn.secondary:hover {
      background-color: #1c2128;
    }

    .loading {
      color: var(--muted);
      text-align: center;
      margin-top: 40px;
      font-size: 14px;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    this._load()
  }

  private async _load() {
    this.isLoading = true
    try {
      const [projectsRes, levelData, subjectData] = await Promise.all([
        queryClient.ensureQueryData({ queryKey: ['projects'], queryFn: getProjects }),
        userBrightId.get()
          ? getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT })
          : Promise.resolve(null),
        userBrightId.get()
          ? getSubjectVerifications(userBrightId.get(), EvaluationCategory.SUBJECT)
          : Promise.resolve(null)
      ])

      projects.set(projectsRes)
      focusedProject.set(projectsRes.find((item) => item.id === this.projectId) ?? null)

      if (levelData) levelUpProgress.set(levelData.requirements)
      if (subjectData) this.auraLevel = subjectData.auraLevel ?? 0
    } finally {
      this.isLoading = false
    }
  }

  protected render() {
    const project = focusedProject.get()
    const requirements = levelUpProgress.get()
    const brightId = userBrightId.get()

    if (this.isLoading || !project) {
      return html`<div class="container"><div class="loading">Loading project details…</div></div>`
    }

    // Fix: check auraLevel directly against the requirement, not a broken array length check
    const isVerified = this.auraLevel >= project.requirementLevel
    const activeRequirements = requirements.filter((r) => r.level <= project.requirementLevel)

    return html`
      <div class="container">
        <div class="header">
          <h1 class="project-name">${project.name}</h1>
          <div class="project-meta">
            <span>Required Verification:</span>
            <span class="level-badge">Level ${project.requirementLevel}</span>
          </div>
        </div>

        ${!brightId
          ? this._renderAuthGate()
          : isVerified
            ? this._renderSuccess(project)
            : this._renderRequirements(activeRequirements)}
      </div>
    `
  }

  private _renderAuthGate() {
    return html`
      <div class="auth-gate">
        <p>Connect your identity to check your verification status.</p>
        <div class="actions">
          <a href="/login" class="back-btn">Sign In</a>
        </div>
      </div>
    `
  }

  private _renderSuccess(project: Project) {
    return html`
      <div class="success-container">
        <div class="success-title">Verification Complete</div>
        <p style="color: var(--muted); font-size: 14px; line-height: 1.5; margin: 0 0 4px;">
          You have met all the requirements to access <strong>${project.name}</strong>.
        </p>
        <div class="actions">
          <a href="/home" class="back-btn">Continue to App</a>
        </div>
      </div>
    `
  }

  private _renderRequirements(
    requirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[]
  ) {
    return html`
      <div>
        <div class="requirements-title">Pending Actions</div>

        <div class="requirements-list">
          ${requirements.map((req) => {
            const passed = req.status === 'passed'
            return html`
              <div class="req-card ${passed ? 'passed' : ''}">
                <div class="status-indicator ${passed ? 'passed' : 'pending'}"></div>
                <div class="req-content">
                  <p class="req-reason">${req.reason}</p>
                  <div class="req-status-text">${passed ? 'Requirement met' : 'Action required'}</div>
                </div>
              </div>
            `
          })}
        </div>

        <div class="actions">
          <a
            href="/home"
            class="back-btn secondary"
          >
            Back to Overview
          </a>
        </div>
      </div>
    `
  }
}
