import { LightElement } from '../light-element';
import { SignalWatcher } from '@lit-labs/signals';
import { html, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { focusedProject } from '@/lib/projects';
import { projects } from '@/states/projects';
import { userBrightId } from '@/states/user';
import type { Project } from '@/types/projects';
import { getProjects, verifyProject } from '@/utils/apis';
import { EvaluationCategory } from '@/utils/aura';
import { getLevelupProgress } from '@/utils/score';
import { getSubjectVerifications } from '@/utils/subject';

import './edit-profile';
import './evaluations-step';
import './find-players';
import './footer';
import './how-it-works';
import './login';
import './progress-step';
import type { ProgressStepData } from './progress-step';
import './score-step';
import './success-step';
import './shared-styles.css';
import './index.css';

export type Step =
  | 'connect'
  | 'progress'
  | 'success'
  | 'how-it-works'
  | 'find-players'
  | 'edit-profile'
  | 'evaluations'
  | 'score';

@customElement('app-verification-embed')
export class AppVerificationElement extends SignalWatcher(LightElement) {
  @property({ type: Number })
  projectId!: number;

  @property({ type: Number })
  height: number = 550;

  /** Testing/demo hooks — when `mock` is true, skip API calls and use the provided mock data */
  @property({ type: Boolean }) mock = false;
  @property({ type: Object }) mockData: ProgressStepData | null = null;
  @property({ type: Object }) mockProject: Project | null = null;
  @property({ type: String }) initialStep: Step | null = null;

  @query('#scrollbar')
  private scrollbar!: HTMLElement;

  @state() private step: Step = 'connect';
  @state() private previousStep: Step = 'connect';
  @state() private isLoadingVerification = false;
  @state() private isGeneratingSignature = false;
  @state() private verificationData: ProgressStepData | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.mock) {
      this._applyMock();
      return;
    }
    this._fetchProjects();
  }

  protected updated(changed: PropertyValues): void {
    if (!this.mock) return;
    if (
      changed.has('mockData') ||
      changed.has('mockProject') ||
      changed.has('initialStep')
    ) {
      this._applyMock();
    }
  }

  private _applyMock() {
    if (this.mockProject) focusedProject.set(this.mockProject);
    this.verificationData = this.mockData;
    const requiredLevel = this.mockProject?.requirementLevel ?? 1;
    const auraLevel = this.mockData?.auraLevel ?? 0;
    const next =
      this.initialStep ?? (auraLevel >= requiredLevel ? 'success' : 'progress');
    this._goToStep(next);
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const scrollBar = this.scrollbar;
    if (!scrollBar) return;

    // Fill the host (which itself fills its container) so the widget takes the
    // full available height instead of a fixed pixel box.
    scrollBar.style.height = '100%';
  }

  private _fetchProjects() {
    getProjects().then((res) => {
      projects.set(res);
      const project = res.find((item) => item.id === this.projectId);
      if (project) focusedProject.set(project);
    });

    const brightId = userBrightId.get();
    if (brightId) {
      this._fetchVerification(brightId);
    }
  }

  private async _fetchVerification(brightId: string) {
    this.isLoadingVerification = true;
    try {
      const [levelData, subjectData] = await Promise.all([
        getLevelupProgress({ evaluationCategory: EvaluationCategory.SUBJECT }),
        getSubjectVerifications(brightId, EvaluationCategory.SUBJECT),
      ]);

      this.verificationData = {
        brightId,
        auraLevel: subjectData?.auraLevel ?? 0,
        auraScore: subjectData?.auraScore ?? 0,
        evaluationsReceived: subjectData?.auraImpacts?.length ?? 0,
        auraImpacts: subjectData?.auraImpacts ?? [],
        requirements: levelData.requirements,
      };

      const project = focusedProject.get();
      const requiredLevel = project?.requirementLevel ?? 1;
      const auraLevel = this.verificationData.auraLevel ?? 0;

      this._goToStep(auraLevel >= requiredLevel ? 'success' : 'progress');
    } catch (err) {
      console.error('Failed to fetch verification data', err);
      // Treat missing profile (404) as a new user with level 0 and score 0
      // so they can continue to find verifiers instead of being stuck on connect
      this.verificationData = {
        brightId,
        auraLevel: 0,
        auraScore: 0,
        evaluationsReceived: 0,
        auraImpacts: [],
        requirements: [],
      };
      this._goToStep('progress');
    } finally {
      this.isLoadingVerification = false;
    }
  }

  private _goToStep(next: Step) {
    this.previousStep = this.step;
    this.step = next;
  }

  private _handleConnected() {
    const brightId = userBrightId.get();
    if (brightId) this._fetchVerification(brightId);
  }

  private _handleDisconnect() {
    this.verificationData = null;
    this._goToStep('connect');
  }

  private async _handleContinue() {
    const brightId = userBrightId.get();
    const data = this.verificationData;
    let signature: string | undefined;
    let publicKey: string | undefined;
    let verificationHash: string | null | undefined;

    // Only verified users reach the success step, so generate the signature
    // from the API before handing control back to the embedding app.
    if (brightId) {
      this.isGeneratingSignature = true;
      try {
        const result = await verifyProject(this.projectId, {
          userId: brightId,
          client: focusedProject.get()?.name ?? 'aura',
          auraScore: data?.auraScore,
          auraLevel: data?.auraLevel,
        });
        signature = result?.signature;
        publicKey = result?.publicKey;
        verificationHash = result?.verificationHash;
      } catch (err) {
        console.error('Failed to generate verification signature', err);
      } finally {
        this.isGeneratingSignature = false;
      }
    }

    window.parent.postMessage(
      JSON.stringify({
        type: 'verification-success',
        app: 'aura',
        data: {
          brightId,
          signature,
          publicKey,
          verificationHash,
          auraLevel: data?.auraLevel,
          auraScore: data?.auraScore,
        },
      }),
      '*',
    );
  }

  protected render() {
    const project = focusedProject.get();
    return html`
      <div id="scrollbar" class="frame scroll">
        <div class="content">${this._renderStep(project)}</div>
        <verification-footer></verification-footer>
      </div>
    `;
  }

  private _renderStep(project: Project | null) {
    if (this.isLoadingVerification) {
      return html`
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Checking your verification…</span>
        </div>
      `;
    }

    const appName = project?.name ?? '';
    const appDescription = project?.description;
    const appLogo = project?.image;
    const requiredLevel = (project?.requirementLevel ?? 1) as 1 | 2 | 3 | 4;

    switch (this.step) {
      case 'connect':
        return html`
          <verification-connect
            .appName=${appName}
            .appDescription=${appDescription}
            .appLogo=${appLogo}
            .requiredLevel=${requiredLevel}
            @connected=${() => this._handleConnected()}
            @how-it-works=${() => this._goToStep('how-it-works')}
          ></verification-connect>
        `;
      case 'progress':
        return html`
          <verification-progress
            .data=${this.verificationData!}
            .requiredLevel=${requiredLevel}
            .appName=${appName}
            @disconnect=${() => this._handleDisconnect()}
            @find-players=${() => this._goToStep('find-players')}
            @edit-profile=${() => this._goToStep('edit-profile')}
            @show-evaluations=${() => this._goToStep('evaluations')}
            @show-score=${() => this._goToStep('score')}
          ></verification-progress>
        `;
      case 'success':
        return html`
          <verification-success
            .appName=${appName}
            .level=${this.verificationData?.auraLevel ?? requiredLevel}
            .loading=${this.isGeneratingSignature}
            @continue=${() => this._handleContinue()}
          ></verification-success>
        `;
      case 'how-it-works':
        return html`
          <verification-how-it-works
            @back=${() => this._goToStep(this.previousStep)}
          ></verification-how-it-works>
        `;
      case 'find-players':
        return html`
          <verification-find-players
            .auraImpacts=${this.verificationData?.auraImpacts ?? []}
            @back=${() => this._goToStep('progress')}
            @select-player=${(e: CustomEvent) => console.log('Selected player:', e.detail)}
          ></verification-find-players>
        `;
      case 'edit-profile':
        return html`
          <verification-edit-profile
            @back=${() => this._goToStep('progress')}
          ></verification-edit-profile>
        `;
      case 'evaluations':
        return html`
          <verification-evaluations
            .impacts=${this.verificationData?.auraImpacts ?? []}
            @back=${() => this._goToStep('progress')}
          ></verification-evaluations>
        `;
      case 'score':
        return html`
          <verification-score
            .impacts=${this.verificationData?.auraImpacts ?? []}
            .totalScore=${this.verificationData?.auraScore ?? 0}
            @back=${() => this._goToStep('progress')}
          ></verification-score>
        `;
      default:
        return html``;
    }
  }
}
