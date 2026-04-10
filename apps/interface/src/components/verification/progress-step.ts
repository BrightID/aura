import { askedEvaluationPlayers } from '@/lib/data/contacts'
import { userFirstName, userLastName, userProfilePicture } from '@/states/user'
import type { AuraImpact } from '@/types/evaluation'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './level-badge'

export interface ProgressStepData {
  brightId: string
  auraLevel: number
  auraScore: number
  evaluationsReceived: number
  auraImpacts: AuraImpact[]
  requirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[]
}

const scoreThresholds: Record<number, number> = {
  1: 1_000_000,
  2: 10_000_000,
  3: 50_000_000,
  4: 100_000_000
}

@customElement('verification-progress')
export class VerificationProgressElement extends SignalWatcher(LitElement) {
  @property({ type: Object }) data!: ProgressStepData
  @property({ type: Number }) requiredLevel = 1
  @property() appName = ''

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

    /* Next steps */
    .next-steps {
      padding: 1em;
      background: var(--secondary);
      border-radius: 0.5em;
      display: flex;
      flex-direction: column;
      gap: 0.75em;
    }
    .next-steps-title {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
      margin: 0;
    }
    .next-steps-title svg {
      width: 1em;
      height: 1em;
      color: var(--aura-warning);
      flex-shrink: 0;
    }
    .next-steps-desc {
      font-size: 0.75em;
      color: var(--muted-foreground);
      line-height: 1.5;
      margin: 0;
    }
    .action-row {
      display: flex;
      gap: 0.5em;
    }
    .action-row a-button {
      flex: 1;
    }

    /* Requirements checklist */
    .requirements {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .req-item {
      display: flex;
      align-items: flex-start;
      gap: 0.625em;
      padding: 0.625em 0.75em;
      border-radius: 0.5em;
      border: 1px solid var(--border);
      font-size: 0.75em;
    }
    .req-item.passed {
      border-color: rgba(74, 222, 128, 0.25);
      background: rgba(74, 222, 128, 0.05);
    }
    .req-item.incomplete {
      background: var(--secondary);
    }
    .req-dot {
      width: 1.25em;
      height: 1.25em;
      border-radius: 9999px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.0625em;
    }
    .req-dot.passed {
      background: var(--aura-success);
    }
    .req-dot.incomplete {
      border: 2px solid var(--muted-foreground);
      background: transparent;
    }
    .req-dot.passed::after {
      content: '';
      width: 0.3125em;
      height: 0.5625em;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }
    .req-reason {
      flex: 1;
      color: var(--foreground);
    }
    .req-status {
      font-size: 0.875em;
      color: var(--muted-foreground);
      margin-top: 0.125em;
    }

    /* Verification guide */
    .guide-section {
      border: 1px solid var(--border);
      border-radius: 0.625em;
      overflow: hidden;
    }
    .guide-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.625em 0.875em;
      background: color-mix(in srgb, var(--primary) 8%, transparent);
      border-bottom: 1px solid var(--border);
    }
    .guide-header-text {
      font-size: 0.8em;
      font-weight: 600;
      color: var(--foreground);
    }
    .guide-header-sub {
      font-size: 0.7em;
      color: var(--muted-foreground);
      margin-left: auto;
    }
    .guide-steps {
      display: flex;
      flex-direction: column;
    }
    .guide-step {
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.625em 0.875em;
      background: none;
      border: none;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      text-align: left;
      font: inherit;
      transition: background 0.15s;
      width: 100%;
    }
    .guide-step:last-child {
      border-bottom: none;
    }
    .guide-step:hover {
      background: color-mix(in srgb, var(--secondary) 70%, var(--foreground) 4%);
    }
    .guide-step-num {
      flex-shrink: 0;
      width: 1.5em;
      height: 1.5em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7em;
      font-weight: 700;
      color: var(--primary);
    }
    .guide-step-num.done {
      background: rgba(74, 222, 128, 0.12);
      border-color: rgba(74, 222, 128, 0.3);
      color: var(--aura-success);
    }
    .guide-step-content {
      flex: 1;
      min-width: 0;
    }
    .guide-step-title {
      font-size: 0.8em;
      font-weight: 500;
      color: var(--foreground);
    }
    .guide-step-desc {
      font-size: 0.7em;
      color: var(--muted-foreground);
      margin-top: 0.1em;
      line-height: 1.4;
    }
    .guide-step-arrow {
      flex-shrink: 0;
      color: var(--muted-foreground);
      transition: transform 0.15s;
    }
    .guide-step:hover .guide-step-arrow {
      transform: translateX(2px);
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
    .next-steps-title iconify-icon {
      width: 1em;
      height: 1em;
      color: var(--aura-warning);
      flex-shrink: 0;
    }
    .guide-step-arrow iconify-icon {
      width: 0.875em;
      height: 0.875em;
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
    // Show only requirements up to the required level — what the user must pass
    const activeRequirements = requirements.filter((r) => r.level <= this.requiredLevel)

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
          : this._renderProgress(
              levelProgress,
              scoreProgress,
              scoreNeeded,
              evalProgress,
              evaluationsReceived,
              needsMore,
              activeRequirements,
              auraLevel,
              auraScore,
              evalTarget,
              hasScoreReq
            )}
        ${this._renderAskedPlayers()}
      </div>
    `
  }

  private _renderProgress(
    levelProgress: number,
    scoreProgress: number,
    scoreNeeded: number | null,
    evalProgress: number,
    evaluationsReceived: number,
    needsMore: number,
    activeRequirements: { reason: string; status: 'passed' | 'incomplete'; level: number }[],
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

      <div class="next-steps">
        <h3 class="next-steps-title">
          <iconify-icon icon="lucide:zap"></iconify-icon>
          Reach Level ${this.requiredLevel} to continue
        </h3>
        <p class="next-steps-desc">
          ${needsMore === 1
            ? 'You need 1 more level. Get evaluated by people who know you to increase your score.'
            : `You need ${needsMore} more levels. Complete evaluations and build your verification score.`}
        </p>
        <div class="action-row">
          <!--<a-button size="sm" @click=${() => this._openGetVerified()}>
            <iconify-icon
              icon="lucide:external-link"
              class="btn-icon"
              width="1em"
              height="1em"
            ></iconify-icon>
            Get Verified
          </a-button>-->
          <a-button variant="secondary" size="sm" @click=${() => this._emit('find-players')}>
            <iconify-icon
              icon="lucide:users"
              class="btn-icon"
              width="1em"
              height="1em"
            ></iconify-icon>
            Find Players
          </a-button>
        </div>
      </div>

      ${activeRequirements.length > 0
        ? html`
            <div class="requirements">
              ${activeRequirements.map(
                (req) => html`
                  <div class="req-item ${req.status}">
                    <div class="req-dot ${req.status}"></div>
                    <div>
                      <div class="req-reason">${req.reason}</div>
                      <div class="req-status">
                        ${req.status === 'passed' ? 'Requirement met' : 'Action required'}
                      </div>
                    </div>
                  </div>
                `
              )}
            </div>
          `
        : ''}

      <div class="guide-section">
        <div class="guide-header">
          <iconify-icon
            icon="streamline-sharp-color:star-2"
            width="1.125em"
            height="1.125em"
          ></iconify-icon>
          <span class="guide-header-text">How to get verified</span>
          <span class="guide-header-sub">3 steps</span>
        </div>
        <div class="guide-steps">
          <button class="guide-step" @click=${() => this._emit('find-players')}>
            <div class="guide-step-num">1</div>
            <div class="guide-step-content">
              <div class="guide-step-title">Find players who can evaluate you</div>
              <div class="guide-step-desc">
                Import your Google Contacts or share your profile link with Aura players
              </div>
            </div>
            <span class="guide-step-arrow">
              <iconify-icon
                icon="lucide:chevron-right"
                width="0.875em"
                height="0.875em"
              ></iconify-icon>
            </span>
          </button>

          <button class="guide-step" @click=${() => this._emit('show-evaluations')}>
            <div class="guide-step-num ${evaluationsReceived > 0 ? 'done' : ''}">
              ${evaluationsReceived > 0
                ? html`<iconify-icon
                    icon="lucide:check"
                    width="0.75em"
                    height="0.75em"
                  ></iconify-icon>`
                : '2'}
            </div>
            <div class="guide-step-content">
              <div class="guide-step-title">Collect evaluations</div>
              <div class="guide-step-desc">
                ${evaluationsReceived > 0
                  ? `You have ${evaluationsReceived} evaluation${evaluationsReceived > 1 ? 's' : ''}. Keep going to grow your score.`
                  : 'Each evaluation from an Aura player raises your level and score'}
              </div>
            </div>
            <span class="guide-step-arrow">
              <iconify-icon
                icon="lucide:chevron-right"
                width="0.875em"
                height="0.875em"
              ></iconify-icon>
            </span>
          </button>

          <button class="guide-step" @click=${() => this._emit('show-score')}>
            <div class="guide-step-num">3</div>
            <div class="guide-step-content">
              <div class="guide-step-title">Grow your Aura score</div>
              <div class="guide-step-desc">
                Reach Level ${this.requiredLevel} — higher-ranked verifiers give bigger score boosts
              </div>
            </div>
            <span class="guide-step-arrow">
              <iconify-icon
                icon="lucide:chevron-right"
                width="0.875em"
                height="0.875em"
              ></iconify-icon>
            </span>
          </button>
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

    return html`
      <div class="asked-section">
        <span class="asked-section-title">
          <iconify-icon icon="lucide:clock"></iconify-icon>
          People You've Asked
        </span>
        ${asked.map(
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
        )}
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
