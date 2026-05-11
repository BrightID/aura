import { SignalWatcher } from '@lit-labs/signals'
import { type CSSResultGroup, css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { askedEvaluationPlayers } from '@/lib/data/contacts'
import { userFirstName, userLastName, userProfilePicture } from '@/states/user'
import type { AuraImpact } from '@/types/evaluation'
import './level-badge'

export interface ProgressStepData {
  brightId: string
  auraLevel: number
  auraScore: number
  evaluationsReceived: number
  auraImpacts: AuraImpact[]
  requirements: {
    reason: string
    status: 'passed' | 'incomplete'
    level: number
  }[]
}

// Score thresholds required to ENTER each level (per Aura leveling spec)
const scoreThresholds: Record<number, number> = {
  1: 10_000_000,
  2: 50_000_000,
  3: 100_000_000,
  4: 150_000_000
}

@customElement('verification-progress')
export class VerificationProgressElement extends SignalWatcher(LitElement) {
  @property({ type: Object }) data!: ProgressStepData
  @property({ type: Number }) requiredLevel = 1
  @property() appName = ''

  @state() private _askedExpanded = false

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
      padding-bottom: 10px;
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }

    /* User header */
    .user-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75em;
    }
    .user-avatar {
      width: 2.5em;
      height: 2.5em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-avatar svg {
      width: 1.25em;
      height: 1.25em;
      color: var(--primary);
    }
    .user-id {
      font-size: 0.875em;
      font-weight: 500;
      margin: 0.25rem;
      color: var(--foreground);
      font-family: monospace;
    }
    .disconnect-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.75em;
      color: var(--muted-foreground);
      padding: 0;
      transition: color 0.15s;
    }
    .disconnect-btn:hover {
      color: var(--foreground);
    }

    /* Level requirement indicator */
    .req-indicator {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.5em 0.75em;
      border-radius: 0.5em;
      font-size: 0.875em;
      border: 1px solid;
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
    .req-indicator svg {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }

    /* Progress bars */
    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }
    .progress-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.875em;
    }
    .progress-label {
      color: var(--muted-foreground);
    }
    .progress-value {
      font-weight: 500;
      color: var(--foreground);
    }
    .progress-track {
      height: 0.5em;
      background: var(--secondary);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 0.5em;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.4s ease-out;
      background: var(--primary);
    }
    .progress-fill.success {
      background: var(--aura-success);
    }

    /* Metric cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75em;
    }
    .metric-card--full {
      grid-column: 1 / -1;
    }
    .metric-card {
      padding: 0.75em;
      background: var(--secondary);
      border-radius: 0.5em;
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      cursor: pointer;
      border: 1px solid transparent;
      transition:
        border-color 0.15s,
        background 0.15s;
      text-align: left;
      width: 100%;
      font: inherit;
    }
    .metric-card:hover {
      border-color: var(--border);
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 4%);
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 0.75em;
      color: var(--muted-foreground);
    }
    .metric-header svg {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }
    .metric-value {
      display: flex;
      align-items: baseline;
      gap: 0.25em;
    }
    .metric-value .num {
      font-size: 1.125em;
      font-weight: 600;
      color: var(--foreground);
    }
    .metric-value .denom {
      font-size: 0.875em;
      color: var(--muted-foreground);
    }
    .metric-bar {
      height: 0.25em;
      background: var(--muted);
      border-radius: 9999px;
      overflow: hidden;
    }
    .metric-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.4s;
    }

    /* Current step card (focused next-action) */
    .step-card {
      display: flex;
      flex-direction: column;
      gap: 0.75em;
      padding: 0.875em;
      background: color-mix(in srgb, var(--primary) 6%, var(--secondary));
      border: 1px solid color-mix(in srgb, var(--primary) 22%, transparent);
      border-radius: 0.625em;
    }
    .step-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5em;
    }
    .step-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3em;
      padding: 0.2em 0.55em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary) 18%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 32%, transparent);
      font-size: 0.62em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 0.3em;
    }
    .stepper-dot {
      width: 0.45em;
      height: 0.45em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--muted-foreground) 35%, transparent);
      transition:
        background 0.2s,
        transform 0.2s;
    }
    .stepper-dot.done {
      background: var(--aura-success);
    }
    .stepper-dot.active {
      background: var(--primary);
      transform: scale(1.5);
    }
    .step-title {
      margin: 0;
      font-size: 0.875em;
      font-weight: 600;
      color: var(--foreground);
      line-height: 1.3;
    }
    .step-desc {
      margin: 0;
      font-size: 0.75em;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .step-cta {
      margin-top: 0.25em;
    }
    .step-cta a-button {
      width: 100%;
    }
    .step-skip {
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
      font-size: 0.7em;
      color: var(--muted-foreground);
      padding: 0.2em 0;
      align-self: center;
      transition: color 0.15s;
    }
    .step-skip:hover {
      color: var(--foreground);
    }

    /* Requirements checklist (grouped by target level) */
    .requirements {
      display: flex;
      flex-direction: column;
      gap: 0.875em;
    }
    .req-group {
      border: 1px solid var(--border);
      border-radius: 0.625em;
      overflow: hidden;
      background: var(--card);
    }
    .req-group-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.5em 0.75em;
      background: color-mix(in srgb, var(--primary) 6%, var(--secondary));
      border-bottom: 1px solid var(--border);
    }
    .req-group-header.done {
      background: color-mix(in srgb, var(--aura-success) 8%, var(--secondary));
    }
    .req-group-title {
      flex: 1;
      font-size: 0.75em;
      font-weight: 600;
      color: var(--foreground);
    }
    .req-group-count {
      font-size: 0.65em;
      font-weight: 600;
      color: var(--muted-foreground);
      padding: 0.15em 0.5em;
      border-radius: 9999px;
      background: var(--secondary);
      border: 1px solid var(--border);
    }
    .req-group-count.done {
      color: var(--aura-success);
      border-color: color-mix(in srgb, var(--aura-success) 30%, transparent);
      background: color-mix(in srgb, var(--aura-success) 12%, transparent);
    }
    .req-items {
      display: flex;
      flex-direction: column;
    }
    .req-item {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.625em 0.75em;
      border-bottom: 1px solid var(--border);
      font-size: 0.75em;
      transition: background 0.15s;
    }
    .req-item:last-child {
      border-bottom: none;
    }
    .req-item.passed .req-reason {
      color: var(--muted-foreground);
      text-decoration: line-through;
      text-decoration-color: color-mix(in srgb, var(--muted-foreground) 50%, transparent);
    }
    .req-check {
      width: 1.125em;
      height: 1.125em;
      border-radius: 9999px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .req-check.passed {
      background: var(--aura-success);
      color: white;
    }
    .req-check.incomplete {
      border: 1.5px dashed color-mix(in srgb, var(--muted-foreground) 55%, transparent);
      background: transparent;
    }
    .req-check iconify-icon {
      width: 0.75em;
      height: 0.75em;
    }
    .req-reason {
      flex: 1;
      color: var(--foreground);
      line-height: 1.35;
    }

    /* Success state */
    .success-state {
      text-align: center;
      padding: 1em 0;
      display: flex;
      flex-direction: column;
      gap: 0.75em;
      align-items: center;
    }
    .success-icon {
      width: 3.5em;
      height: 3.5em;
      border-radius: 9999px;
      background: rgba(74, 222, 128, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .success-icon svg {
      width: 2em;
      height: 2em;
      color: var(--aura-success);
    }
    .success-title {
      margin: 0;
      font-weight: 600;
      color: var(--foreground);
    }
    .success-desc {
      margin: 0;
      font-size: 0.875em;
      color: var(--muted-foreground);
    }

    /* Inline svg helpers */
    .btn-icon {
      display: inline;
      margin-right: 0.375em;
      vertical-align: -0.125em;
    }

    .user-avatar iconify-icon {
      color: var(--primary);
    }
    .req-indicator iconify-icon {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
    .metric-header iconify-icon {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }
    .success-icon iconify-icon {
      color: var(--aura-success);
    }

    /* Avatar image */
    .user-avatar-img {
      width: 2.5em;
      height: 2.5em;
      border-radius: 9999px;
      object-fit: cover;
      flex-shrink: 0;
    }

    /* Header actions */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .edit-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.75em;
      color: var(--primary);
      padding: 0;
      transition: opacity 0.15s;
    }
    .edit-btn:hover {
      opacity: 0.75;
    }

    /* ── Asked players section ──────────────── */
    .asked-section {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .asked-section-title {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 0.7em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .asked-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .asked-section-title iconify-icon {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }
    .asked-player-row {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.5em 0.625em;
      border-radius: 0.5em;
      border: 1px solid var(--border);
      background: var(--secondary);
    }
    .asked-avatar {
      width: 1.875em;
      height: 1.875em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary) 14%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65em;
      font-weight: 700;
      color: var(--primary);
      overflow: hidden;
      flex-shrink: 0;
    }
    .asked-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .asked-player-info {
      flex: 1;
      min-width: 0;
    }
    .asked-player-name {
      font-size: 0.8em;
      font-weight: 500;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .asked-player-sub {
      font-size: 0.68em;
      color: var(--muted-foreground);
      margin-top: 0.1em;
      display: flex;
      align-items: center;
      gap: 0.25em;
    }
    .asked-player-sub iconify-icon {
      width: 0.7em;
      height: 0.7em;
      flex-shrink: 0;
    }
    .asked-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      font-size: 0.62em;
      font-weight: 600;
      border-radius: 9999px;
      padding: 0.2em 0.55em;
      flex-shrink: 0;
    }
    .asked-status-badge.waiting {
      color: var(--aura-info, #06b6d4);
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.22);
    }
    .asked-status-badge iconify-icon {
      width: 0.65em;
      height: 0.65em;
    }

    /* Compact asked summary (widget-friendly) */
    .asked-summary {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.5em 0.75em;
      border-radius: 0.5em;
      border: 1px solid var(--border);
      background: var(--secondary);
      cursor: pointer;
      font: inherit;
      text-align: left;
      width: 100%;
      transition: background 0.15s;
    }
    .asked-summary:hover {
      background: color-mix(in srgb, var(--secondary) 70%, var(--foreground) 4%);
    }
    .avatar-stack {
      display: flex;
      flex-shrink: 0;
    }
    .avatar-stack .asked-avatar {
      border: 2px solid var(--card);
      margin-left: -0.4em;
    }
    .avatar-stack .asked-avatar:first-child {
      margin-left: 0;
    }
    .asked-summary-text {
      flex: 1;
      min-width: 0;
      font-size: 0.75em;
      color: var(--foreground);
    }
    .asked-summary-text strong {
      font-weight: 600;
    }
    .asked-summary-sub {
      display: block;
      font-size: 0.9em;
      color: var(--muted-foreground);
      margin-top: 0.1em;
    }
    .asked-chevron {
      flex-shrink: 0;
      color: var(--muted-foreground);
      transition: transform 0.2s;
    }
    .asked-chevron iconify-icon {
      width: 0.875em;
      height: 0.875em;
    }
    .asked-summary[aria-expanded='true'] .asked-chevron {
      transform: rotate(180deg);
    }
  `

  protected render() {
    if (!this.data) return html``

    const { brightId, auraLevel, auraScore, evaluationsReceived, requirements } = this.data
    const isMet = auraLevel >= this.requiredLevel
    const nextLevel = auraLevel + 1
    const scoreNeeded = scoreThresholds[nextLevel] ?? null
    const hasScoreReq = scoreNeeded !== null && scoreNeeded > 0
    const levelProgress = Math.min((auraLevel / this.requiredLevel) * 100, 100)
    const scoreProgress = hasScoreReq ? Math.min((auraScore / scoreNeeded!) * 100, 100) : 0
    // Eval target: level 4 requires 2 evals, everything else requires 1
    const evalTarget = nextLevel >= 4 ? 2 : 1
    const evalProgress = Math.min((evaluationsReceived / evalTarget) * 100, 100)
    const needsMore = this.requiredLevel - auraLevel
    // Show only requirements for levels the user has NOT yet reached, up to the required level
    const activeRequirements = requirements.filter(
      (r) => r.level > auraLevel && r.level <= this.requiredLevel
    )

    return html`
      <div class="stack">
        <!-- User header -->
        <div class="user-header">
          <div class="user-info">
            ${userProfilePicture.get()
              ? html`<img src=${userProfilePicture.get()} alt="avatar" class="user-avatar-img" />`
              : html`
                  <div class="user-avatar">
                    <iconify-icon icon="lucide:user" width="1.25em" height="1.25em"></iconify-icon>
                  </div>
                `}
            <div>
              <p class="user-id">${userFirstName.get() + ' ' + userLastName.get()}</p>
              <verification-level-badge
                .level=${auraLevel ?? 0}
                size="sm"
              ></verification-level-badge>
            </div>
          </div>
          <div class="header-actions">
            <button class="edit-btn" @click=${() => this._emit('edit-profile')}>Edit</button>
            <button class="disconnect-btn" @click=${() => this._emit('disconnect')}>
              <iconify-icon icon="mdi:shutdown" width="20" height="20"></iconify-icon>
            </button>
          </div>
        </div>

        <div class="req-indicator ${isMet ? 'met' : 'unmet'}">
          ${isMet
            ? html`<iconify-icon icon="lucide:check"></iconify-icon>`
            : html`<iconify-icon icon="lucide:circle-help"></iconify-icon>`}
          <span
            >${isMet
              ? `Level ${this.requiredLevel} requirement met`
              : `Level ${this.requiredLevel} required`}</span
          >
        </div>

        ${isMet
          ? this._renderSuccess()
          : html`
              ${this._renderCurrentStep(evaluationsReceived, auraLevel)}
              ${this._renderRequirements(activeRequirements)} ${this._renderAskedPlayers()}
              ${this._renderProgress(
                levelProgress,
                scoreProgress,
                scoreNeeded,
                evalProgress,
                evaluationsReceived,
                auraLevel,
                auraScore,
                evalTarget,
                hasScoreReq
              )}
            `}
      </div>
    `
  }

  private _renderProgress(
    levelProgress: number,
    scoreProgress: number,
    scoreNeeded: number | null,
    evalProgress: number,
    evaluationsReceived: number,
    auraLevel: number,
    auraScore: number,
    evalTarget: number,
    hasScoreReq: boolean
  ) {
    const scoreDisplay =
      auraScore >= 1_000_000 ? `${(auraScore / 1_000_000).toFixed(1)}M` : auraScore.toLocaleString()
    const scoreNeededDisplay =
      scoreNeeded !== null
        ? scoreNeeded >= 1_000_000
          ? `${(scoreNeeded / 1_000_000).toFixed(0)}M`
          : scoreNeeded.toLocaleString()
        : '—'

    return html`
      <div class="progress-section">
        <div>
          <div class="progress-row">
            <span class="progress-label">Verification Progress</span>
            <span class="progress-value">Level ${auraLevel} → Level ${this.requiredLevel}</span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill ${levelProgress >= 100 ? 'success' : ''}"
              style="width: ${levelProgress}%"
            ></div>
          </div>
        </div>

        <div class="metrics-grid">
          <button
            class="metric-card ${hasScoreReq ? '' : 'metric-card--full'}"
            @click=${() => this._emit('show-evaluations')}
          >
            <div class="metric-header">
              <iconify-icon icon="lucide:users"></iconify-icon>
              Evaluations
            </div>
            <div class="metric-value">
              <span class="num">${evaluationsReceived}</span>
              <span class="denom">/ ${evalTarget}</span>
            </div>
            <div class="metric-bar">
              <div
                class="metric-bar-fill"
                style="width: ${evalProgress}%; background: var(--aura-info)"
              ></div>
            </div>
          </button>

          ${hasScoreReq
            ? html`
                <button class="metric-card" @click=${() => this._emit('show-score')}>
                  <div class="metric-header">
                    <iconify-icon icon="lucide:trending-up"></iconify-icon>
                    Score
                  </div>
                  <div class="metric-value">
                    <span class="num">${scoreDisplay}</span>
                    <span class="denom">/ ${scoreNeededDisplay}</span>
                  </div>
                  <div class="metric-bar">
                    <div
                      class="metric-bar-fill"
                      style="width: ${scoreProgress}%; background: var(--aura-warning)"
                    ></div>
                  </div>
                </button>
              `
            : ''}
        </div>
      </div>
    `
  }

  private _renderRequirements(
    activeRequirements: {
      reason: string
      status: 'passed' | 'incomplete'
      level: number
    }[]
  ) {
    if (activeRequirements.length === 0) return html``

    const byLevel = new Map<
      number,
      { reason: string; status: 'passed' | 'incomplete'; level: number }[]
    >()
    for (const req of activeRequirements) {
      const arr = byLevel.get(req.level) ?? []
      arr.push(req)
      byLevel.set(req.level, arr)
    }
    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b)

    return html`
      <div class="requirements">
        ${levels.map((level) => {
          const items = byLevel.get(level)!
          const done = items.filter((r) => r.status === 'passed').length
          const total = items.length
          const allDone = done === total
          return html`
            <div class="req-group">
              <div class="req-group-header ${allDone ? 'done' : ''}">
                <span class="req-group-title">To reach Level ${level}</span>
                <span class="req-group-count ${allDone ? 'done' : ''}">${done} / ${total}</span>
              </div>
              <div class="req-items">
                ${items.map(
                  (req) => html`
                    <div class="req-item ${req.status}">
                      <div class="req-check ${req.status}">
                        ${req.status === 'passed'
                          ? html`<iconify-icon icon="lucide:check"></iconify-icon>`
                          : ''}
                      </div>
                      <div class="req-reason">${req.reason}</div>
                    </div>
                  `
                )}
              </div>
            </div>
          `
        })}
      </div>
    `
  }

  private _currentStepIndex(evaluationsReceived: number, auraLevel: number): 0 | 1 | 2 {
    const asked = askedEvaluationPlayers.get().length
    if (asked === 0 && evaluationsReceived === 0) return 0
    if (evaluationsReceived === 0) return 1
    if (auraLevel < this.requiredLevel) return 2
    return 2
  }

  private _renderCurrentStep(evaluationsReceived: number, auraLevel: number) {
    const idx = this._currentStepIndex(evaluationsReceived, auraLevel)
    const steps = [
      {
        title: 'Find players who can evaluate you',
        desc: 'Import Google Contacts or share your profile link with Aura players.',
        ctaLabel: 'Find players',
        ctaIcon: 'lucide:users',
        action: () => this._emit('find-players')
      },
      {
        title: 'Collect evaluations',
        desc: 'Waiting for evaluations. Share with more players to speed things up.',
        ctaLabel: 'Share with more',
        ctaIcon: 'lucide:share-2',
        action: () => this._emit('find-players')
      },
      {
        title: `Reach Level ${this.requiredLevel}`,
        desc:
          evaluationsReceived > 0
            ? `You have ${evaluationsReceived} evaluation${evaluationsReceived > 1 ? 's' : ''}. Higher-ranked verifiers give bigger score boosts.`
            : 'Higher-ranked verifiers give bigger score boosts.',
        ctaLabel: 'View score',
        ctaIcon: 'lucide:trending-up',
        action: () => this._emit('show-score')
      }
    ] as const
    const step = steps[idx]
    const pillLabel = `Step ${idx + 1} of 3`

    return html`
      <div class="step-card">
        <div class="step-card-top">
          <span class="step-pill">
            <iconify-icon icon="lucide:zap" width="0.75em" height="0.75em"></iconify-icon>
            ${pillLabel}
          </span>
          <div class="stepper" role="progressbar" aria-valuenow=${idx + 1} aria-valuemax="3">
            ${[0, 1, 2].map(
              (i) => html`
                <span class="stepper-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>
              `
            )}
          </div>
        </div>
        <h3 class="step-title">${step.title}</h3>
        <p class="step-desc">${step.desc}</p>
        <div class="step-cta">
          <a-button size="md" @click=${step.action}>
            <iconify-icon
              icon=${step.ctaIcon}
              class="btn-icon"
              width="1em"
              height="1em"
            ></iconify-icon>
            ${step.ctaLabel}
          </a-button>
        </div>
      </div>
    `
  }

  private _renderSuccess() {
    return html`
      <div class="success-state">
        <div class="success-icon">
          <iconify-icon icon="lucide:circle-check" width="2em" height="2em"></iconify-icon>
        </div>
        <h3 class="success-title">Verification Complete</h3>
        <p class="success-desc">You meet the requirements for ${this.appName}</p>
      </div>
    `
  }

  private _renderAskedPlayers() {
    const asked = askedEvaluationPlayers.get()
    if (!asked.length) return html``

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const stack = asked.slice(0, 3)
    const count = asked.length
    const expanded = this._askedExpanded

    return html`
      <div class="asked-section">
        <button
          class="asked-summary"
          aria-expanded=${expanded ? 'true' : 'false'}
          @click=${() => (this._askedExpanded = !expanded)}
        >
          <div class="avatar-stack">
            ${stack.map(
              (p) => html`
                <div class="asked-avatar">
                  ${p.photo ? html`<img src=${p.photo} alt=${p.name} />` : getInitials(p.name)}
                </div>
              `
            )}
          </div>
          <div class="asked-summary-text">
            <strong>${count}</strong> ${count === 1 ? 'person' : 'people'} waiting to evaluate you
            <span class="asked-summary-sub">Tap to ${expanded ? 'hide' : 'view'}</span>
          </div>
          <span class="asked-chevron">
            <iconify-icon icon="lucide:chevron-down"></iconify-icon>
          </span>
        </button>
        ${expanded
          ? asked.map(
              (player) => html`
                <div class="asked-player-row">
                  <div class="asked-avatar">
                    ${player.photo
                      ? html`<img src=${player.photo} alt=${player.name} />`
                      : getInitials(player.name)}
                  </div>
                  <div class="asked-player-info">
                    <div class="asked-player-name">${player.name}</div>
                    <div class="asked-player-sub">
                      <iconify-icon icon="lucide:clock"></iconify-icon>
                      Waiting for evaluation
                    </div>
                  </div>
                  <span class="asked-status-badge waiting">
                    <iconify-icon icon="lucide:hourglass"></iconify-icon>
                    Waiting
                  </span>
                </div>
              `
            )
          : ''}
      </div>
    `
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))
  }
}
