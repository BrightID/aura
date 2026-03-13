import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './level-badge'

export interface ProgressStepData {
  brightId: string
  auraLevel: number
  auraScore: number
  evaluationsReceived: number
  requirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[]
}

const scoreThresholds: Record<number, number> = {
  1: 1_000_000,
  2: 10_000_000,
  3: 50_000_000,
  4: 100_000_000,
}

@customElement('verification-progress')
export class VerificationProgressElement extends LitElement {
  @property({ type: Object }) data!: ProgressStepData
  @property({ type: Number }) requiredLevel = 1
  @property() appName = ''

  @state() private showTips = false

  static styles: CSSResultGroup = css`
    :host { display: block; font-size: inherit; }
    .stack { display: flex; flex-direction: column; gap: 1em; }

    /* User header */
    .user-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .user-info   { display: flex; align-items: center; gap: 0.75em; }
    .user-avatar {
      width: 2.5em; height: 2.5em; border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .user-avatar svg { width: 1.25em; height: 1.25em; color: var(--primary); }
    .user-id { font-size: 0.875em; font-weight: 500; color: var(--foreground); font-family: monospace; }
    .disconnect-btn {
      background: none; border: none; cursor: pointer;
      font-size: 0.75em; color: var(--muted-foreground);
      padding: 0; transition: color 0.15s;
    }
    .disconnect-btn:hover { color: var(--foreground); }

    /* Level requirement indicator */
    .req-indicator {
      display: flex; align-items: center; gap: 0.5em;
      padding: 0.5em 0.75em;
      border-radius: 0.5em; font-size: 0.875em; border: 1px solid;
    }
    .req-indicator.met {
      background: rgba(74, 222, 128, 0.1);
      color: var(--aura-success);
      border-color: rgba(74, 222, 128, 0.2);
    }
    .req-indicator.unmet {
      background: var(--secondary);
      color: var(--muted-foreground);
      border-color: var(--border);
    }
    .req-indicator svg { width: 1em; height: 1em; flex-shrink: 0; }

    /* Progress bars */
    .progress-section { display: flex; flex-direction: column; gap: 1em; }
    .progress-row {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 0.875em;
    }
    .progress-label { color: var(--muted-foreground); }
    .progress-value { font-weight: 500; color: var(--foreground); }
    .progress-track {
      height: 0.5em; background: var(--secondary);
      border-radius: 9999px; overflow: hidden; margin-top: 0.5em;
    }
    .progress-fill {
      height: 100%; border-radius: 9999px; transition: width 0.4s ease-out;
      background: var(--primary);
    }
    .progress-fill.success { background: var(--aura-success); }

    /* Metric cards */
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75em; }
    .metric-card {
      padding: 0.75em; background: var(--secondary);
      border-radius: 0.5em; display: flex; flex-direction: column; gap: 0.5em;
    }
    .metric-header {
      display: flex; align-items: center; gap: 0.5em;
      font-size: 0.75em; color: var(--muted-foreground);
    }
    .metric-header svg { width: 0.875em; height: 0.875em; flex-shrink: 0; }
    .metric-value { display: flex; align-items: baseline; gap: 0.25em; }
    .metric-value .num   { font-size: 1.125em; font-weight: 600; color: var(--foreground); }
    .metric-value .denom { font-size: 0.875em; color: var(--muted-foreground); }
    .metric-bar { height: 0.25em; background: var(--muted); border-radius: 9999px; overflow: hidden; }
    .metric-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.4s; }

    /* Next steps */
    .next-steps {
      padding: 1em; background: var(--secondary);
      border-radius: 0.5em; display: flex; flex-direction: column; gap: 0.75em;
    }
    .next-steps-title {
      display: flex; align-items: center; gap: 0.5em;
      font-size: 0.875em; font-weight: 500; color: var(--foreground); margin: 0;
    }
    .next-steps-title svg { width: 1em; height: 1em; color: var(--aura-warning); flex-shrink: 0; }
    .next-steps-desc { font-size: 0.75em; color: var(--muted-foreground); line-height: 1.5; margin: 0; }
    .action-row { display: flex; gap: 0.5em; }
    .action-row a-button { flex: 1; }

    /* Requirements checklist */
    .requirements { display: flex; flex-direction: column; gap: 0.5em; }
    .req-item {
      display: flex; align-items: flex-start; gap: 0.625em;
      padding: 0.625em 0.75em;
      border-radius: 0.5em; border: 1px solid var(--border);
      font-size: 0.75em;
    }
    .req-item.passed    { border-color: rgba(74, 222, 128, 0.25); background: rgba(74, 222, 128, 0.05); }
    .req-item.incomplete { background: var(--secondary); }
    .req-dot {
      width: 1.25em; height: 1.25em; border-radius: 9999px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; margin-top: 0.0625em;
    }
    .req-dot.passed     { background: var(--aura-success); }
    .req-dot.incomplete { border: 2px solid var(--muted-foreground); background: transparent; }
    .req-dot.passed::after {
      content: ''; width: 0.3125em; height: 0.5625em;
      border: solid white; border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }
    .req-reason { flex: 1; color: var(--foreground); }
    .req-status { font-size: 0.875em; color: var(--muted-foreground); margin-top: 0.125em; }

    /* Tips accordion */
    .tips-toggle {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 0.5em 0.75em;
      background: var(--secondary); border: none; border-radius: 0.5em;
      cursor: pointer; font-size: 0.75em; color: var(--muted-foreground);
      transition: background 0.15s;
    }
    .tips-toggle:hover {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .tips-toggle-left { display: flex; align-items: center; gap: 0.5em; }
    .tips-toggle-left svg { width: 0.875em; height: 0.875em; color: var(--primary); }
    .tips-chevron { width: 1em; height: 1em; transition: transform 0.2s; }
    .tips-chevron.open { transform: rotate(180deg); }
    .tips-list {
      padding: 0.625em 0.75em;
      background: var(--secondary); border-radius: 0.5em;
      border: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 0.5em;
    }
    .tip-item {
      display: flex; align-items: flex-start; gap: 0.5em;
      font-size: 0.75em; color: var(--muted-foreground);
    }
    .tip-num { color: var(--primary); flex-shrink: 0; }

    /* Success state */
    .success-state {
      text-align: center; padding: 1em 0;
      display: flex; flex-direction: column; gap: 0.75em; align-items: center;
    }
    .success-icon {
      width: 3.5em; height: 3.5em; border-radius: 9999px;
      background: rgba(74, 222, 128, 0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .success-icon svg { width: 2em; height: 2em; color: var(--aura-success); }
    .success-title { margin: 0; font-weight: 600; color: var(--foreground); }
    .success-desc  { margin: 0; font-size: 0.875em; color: var(--muted-foreground); }

    /* Inline svg helpers */
    .btn-icon {
      display: inline; margin-right: 0.375em;
      vertical-align: -0.125em;
    }
  `

  protected render() {
    if (!this.data) return html``

    const { brightId, auraLevel, auraScore, evaluationsReceived, requirements } = this.data
    const isMet = auraLevel >= this.requiredLevel
    const nextLevel = auraLevel + 1
    const scoreNeeded = scoreThresholds[nextLevel] ?? scoreThresholds[4] ?? 100_000_000
    const levelProgress = Math.min((auraLevel / this.requiredLevel) * 100, 100)
    const scoreProgress = Math.min((auraScore / scoreNeeded) * 100, 100)
    const evalProgress  = Math.min((evaluationsReceived / 3) * 100, 100)
    const needsMore = this.requiredLevel - auraLevel
    const activeRequirements = requirements.filter(r => r.level <= this.requiredLevel + 1)

    return html`
      <div class="stack">
        <!-- User header -->
        <div class="user-header">
          <div class="user-info">
            <div class="user-avatar">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p class="user-id">${brightId.slice(0, 12)}…</p>
              <verification-level-badge .level=${auraLevel} size="sm"></verification-level-badge>
            </div>
          </div>
          <button class="disconnect-btn" @click=${() => this._emit('disconnect')}>Disconnect</button>
        </div>

        <!-- Requirement status -->
        <div class="req-indicator ${isMet ? 'met' : 'unmet'}">
          ${isMet
            ? html`<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
            : html`<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-6a8 8 0 11-16 0 8 8 0 0116 0z"/></svg>`}
          <span>${isMet
            ? `Level ${this.requiredLevel} requirement met`
            : `Level ${this.requiredLevel} required`}</span>
        </div>

        ${isMet
          ? this._renderSuccess()
          : this._renderProgress(levelProgress, scoreProgress, scoreNeeded, evalProgress, evaluationsReceived, needsMore, activeRequirements, auraLevel, auraScore)}
      </div>
    `
  }

  private _renderProgress(
    levelProgress: number,
    scoreProgress: number,
    scoreNeeded: number,
    evalProgress: number,
    evaluationsReceived: number,
    needsMore: number,
    activeRequirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[],
    auraLevel: number,
    auraScore: number,
  ) {
    const scoreDisplay = auraScore >= 1_000_000
      ? `${(auraScore / 1_000_000).toFixed(1)}M`
      : auraScore.toLocaleString()
    const scoreNeededDisplay = scoreNeeded >= 1_000_000
      ? `${(scoreNeeded / 1_000_000).toFixed(0)}M`
      : scoreNeeded.toLocaleString()

    return html`
      <div class="progress-section">
        <div>
          <div class="progress-row">
            <span class="progress-label">Verification Progress</span>
            <span class="progress-value">Level ${auraLevel} → Level ${this.requiredLevel}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${levelProgress >= 100 ? 'success' : ''}"
              style="width: ${levelProgress}%"></div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Evaluations
            </div>
            <div class="metric-value">
              <span class="num">${evaluationsReceived}</span>
              <span class="denom">/ 3</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill" style="width: ${evalProgress}%; background: var(--aura-info)"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              Score
            </div>
            <div class="metric-value">
              <span class="num">${scoreDisplay}</span>
              <span class="denom">/ ${scoreNeededDisplay}</span>
            </div>
            <div class="metric-bar">
              <div class="metric-bar-fill" style="width: ${scoreProgress}%; background: var(--aura-warning)"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="next-steps">
        <h3 class="next-steps-title">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Reach Level ${this.requiredLevel} to continue
        </h3>
        <p class="next-steps-desc">
          ${needsMore === 1
            ? 'You need 1 more level. Get evaluated by people who know you to increase your score.'
            : `You need ${needsMore} more levels. Complete evaluations and build your verification score.`}
        </p>
        <div class="action-row">
          <a-button size="sm" @click=${() => this._openGetVerified()}>
            <svg class="btn-icon" width="1em" height="1em" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Get Verified
          </a-button>
          <a-button variant="secondary" size="sm" @click=${() => this._emit('find-players')}>
            <svg class="btn-icon" width="1em" height="1em" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Find Players
          </a-button>
        </div>
      </div>

      ${activeRequirements.length > 0 ? html`
        <div class="requirements">
          ${activeRequirements.map(req => html`
            <div class="req-item ${req.status}">
              <div class="req-dot ${req.status}"></div>
              <div>
                <div class="req-reason">${req.reason}</div>
                <div class="req-status">${req.status === 'passed' ? 'Requirement met' : 'Action required'}</div>
              </div>
            </div>
          `)}
        </div>
      ` : ''}

      <button class="tips-toggle" @click=${() => this.showTips = !this.showTips}>
        <span class="tips-toggle-left">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          Tips to level up faster
        </span>
        <svg class="tips-chevron ${this.showTips ? 'open' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      ${this.showTips ? html`
        <div class="tips-list">
          ${['Ask friends who already use BrightID to evaluate you',
             'Join community verification events',
             'Higher confidence evaluations increase your score more',
             'Connect with more verified players to build trust',
          ].map((tip, i) => html`
            <div class="tip-item">
              <span class="tip-num">${i + 1}.</span>
              <span>${tip}</span>
            </div>
          `)}
        </div>
      ` : ''}
    `
  }

  private _renderSuccess() {
    return html`
      <div class="success-state">
        <div class="success-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="success-title">Verification Complete</h3>
        <p class="success-desc">You meet the requirements for ${this.appName}</p>
      </div>
    `
  }

  private _openGetVerified() {
    window.open('https://brightid.gitbook.io/aura/getting-started/get-brightid', '_blank')
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))
  }
}
