import { focusedProject } from '@/lib/projects'
import { projects } from '@/states/projects'
import { userBrightId } from '@/states/user'
import type { Project } from '@/types/projects'
import { getProjects } from '@/utils/apis'
import { EvaluationCategory } from '@/utils/aura'
import { getLevelupProgress } from '@/utils/score'
import { getSubjectVerifications } from '@/utils/subject'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import './find-players'
import './footer'
import './how-it-works'
import './intro-step'
import './login'
import './progress-step'
import './success-step'
import type { ProgressStepData } from './progress-step'

export type Step = 'intro' | 'connect' | 'progress' | 'success' | 'how-it-works' | 'find-players'

@customElement('app-verification-embed')
export class AppVerificationElement extends SignalWatcher(LitElement) {
  @property({ type: Number })
  projectId!: number

  @state() private step: Step = 'intro'
  @state() private previousStep: Step = 'intro'
  @state() private isLoadingVerification = false
  @state() private verificationData: ProgressStepData | null = null

  // Set --verification-size on the element to scale the entire widget.
  // e.g. 0.875rem = compact, 0.75rem = modal/tiny
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: var(--verification-size, 1rem);
    }

    .frame {
      width: 100%;
      border-radius: var(--radius, 0.75rem);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--card);
      position: relative;
    }

    .content {
      padding: 1.25em;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 8em;
      gap: 0.75em;
      color: var(--muted-foreground);
      font-size: 0.875em;
    }

    .spinner {
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 9999px;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `

  connectedCallback(): void {
    super.connectedCallback()
    this._fetchProjects()
  }

  private _fetchProjects() {
    getProjects().then(res => {
      projects.set(res)
      const project = res.find(item => item.id === this.projectId)
      if (project) focusedProject.set(project)
    })

    const brightId = userBrightId.get()
    if (brightId) {
      this._fetchVerification(brightId)
    }
  }

  private async _fetchVerification(brightId: string) {
    this.isLoadingVerification = true
    try {
      const [levelData, subjectData] = await Promise.all([
        getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }),
        getSubjectVerifications(brightId, EvaluationCategory.SUBJECT),
      ])

      this.verificationData = {
        brightId,
        auraLevel: subjectData?.auraLevel ?? 0,
        auraScore: subjectData?.auraScore ?? 0,
        evaluationsReceived: subjectData?.auraImpacts?.length ?? 0,
        requirements: levelData.requirements,
      }

      const project = focusedProject.get()
      const requiredLevel = project?.requirementLevel ?? 1
      const auraLevel = this.verificationData.auraLevel ?? 0

      this._goToStep(auraLevel >= requiredLevel ? 'success' : 'progress')
    } catch (err) {
      console.error('Failed to fetch verification data', err)
    } finally {
      this.isLoadingVerification = false
    }
  }

  private _goToStep(next: Step) {
    this.previousStep = this.step
    this.step = next
  }

  private _handleConnected() {
    const brightId = userBrightId.get()
    if (brightId) this._fetchVerification(brightId)
  }

  private _handleDisconnect() {
    this.verificationData = null
    this._goToStep('connect')
  }

  private _handleContinue() {
    window.parent.postMessage(
      JSON.stringify({ type: 'verification-success', app: 'aura-get-verified' }),
      '*'
    )
  }

  protected render() {
    const project = focusedProject.get()
    return html`
      <div class="frame">
        <div class="content">${this._renderStep(project)}</div>
        <verification-footer></verification-footer>
      </div>
    `
  }

  private _renderStep(project: Project | null) {
    if (this.isLoadingVerification) {
      return html`
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Checking your verification…</span>
        </div>
      `
    }

    const appName = project?.name ?? ''
    const appDescription = project?.description
    const appLogo = project?.image
    const requiredLevel = (project?.requirementLevel ?? 1) as 1 | 2 | 3 | 4

    switch (this.step) {
      case 'intro':
        return html`
          <verification-intro
            .appName=${appName}
            .appDescription=${appDescription}
            .appLogo=${appLogo}
            .requiredLevel=${requiredLevel}
            @continue=${() => this._goToStep('connect')}
            @how-it-works=${() => this._goToStep('how-it-works')}
          ></verification-intro>
        `
      case 'connect':
        return html`
          <verification-connect
            @connected=${() => this._handleConnected()}
            @how-it-works=${() => this._goToStep('how-it-works')}
          ></verification-connect>
        `
      case 'progress':
        return html`
          <verification-progress
            .data=${this.verificationData}
            .requiredLevel=${requiredLevel}
            .appName=${appName}
            @disconnect=${() => this._handleDisconnect()}
            @find-players=${() => this._goToStep('find-players')}
          ></verification-progress>
        `
      case 'success':
        return html`
          <verification-success
            .appName=${appName}
            .level=${this.verificationData?.auraLevel ?? requiredLevel}
            @continue=${() => this._handleContinue()}
          ></verification-success>
        `
      case 'how-it-works':
        return html`
          <verification-how-it-works
            @back=${() => this._goToStep(this.previousStep)}
          ></verification-how-it-works>
        `
      case 'find-players':
        return html`
          <verification-find-players
            @back=${() => this._goToStep('progress')}
            @select-player=${(e: CustomEvent) => console.log('Selected player:', e.detail)}
          ></verification-find-players>
        `
      default:
        return html``
    }
  }
}
