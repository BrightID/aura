import { focusedProject } from '@/lib/projects'
import { projects } from '@/states/projects'
import { getProjects } from '@/utils/apis'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import { SignalWatcher } from '@lit-labs/signals'
import './footer'
import './intro-step'

export type Step = 'intro' | 'connect' | 'progress' | 'success' | 'how-it-works' | 'find-players'

@customElement('app-verification-embed')
export class AppVerificationElement extends SignalWatcher(LitElement) {
  @property({
    type: Number
  })
  projectId!: number

  @state()
  step: Step = 'intro'

  static styles?: CSSResultGroup | undefined = css`
    .container {
      max-width: 380px;
      margin: auto;
      border-radius: var(--xl);
      overflow: hidden;
      border: 1px solid var(--border);
      position: relative;
      padding: 12px;
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    this.fetchProjects()
  }

  private fetchProjects() {
    getProjects().then((res) => {
      projects.set(res)
      const project = res.find((item) => item.id === this.projectId)
      if (!project) return

      focusedProject.set(project)
    })
  }

  protected render() {
    return html` <a-card class="container">
      ${this.renderTabsSection()}
      <verification-footer></verification-footer>
    </a-card>`
  }

  protected renderTabsSection() {
    const project = focusedProject.get()

    switch (this.step) {
      case 'connect':
      case 'find-players':
      case 'intro':
        return html`<verification-intro
          .appDescription=${project?.description}
          .appLogo=${project?.image}
          .requiredLevel=${Number(project?.requirementLevel)}
          .appName=${project?.name ?? 'loading'}
        ></verification-intro>`
      case 'progress':
      case 'success':
      case 'how-it-works':
    }
  }
}
