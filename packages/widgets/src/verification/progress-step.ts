import { icon } from '../icon';
import { LightElement } from '../light-element';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { askedEvaluationPlayers } from '@/lib/data/contacts';
import { userFirstName, userLastName, userProfilePicture } from '@/states/user';
import type { AuraImpact } from '@/types/evaluation';
import './level-badge';
import './shared-styles.css';
import './progress-step.css';

export interface ProgressStepData {
  brightId: string;
  auraLevel: number;
  auraScore: number;
  evaluationsReceived: number;
  auraImpacts: AuraImpact[];
  requirements: {
    reason: string;
    status: 'passed' | 'incomplete';
    level: number;
  }[];
}

// Score thresholds required to ENTER each level (per Aura leveling spec)
const scoreThresholds: Record<number, number> = {
  1: 10_000_000,
  2: 50_000_000,
  3: 100_000_000,
  4: 150_000_000,
};

@customElement('verification-progress')
export class VerificationProgressElement extends SignalWatcher(LightElement) {
  @property({ type: Object }) data!: ProgressStepData;
  @property({ type: Number }) requiredLevel = 1;
  @property() appName = '';

  @state() private _askedExpanded = false;

  protected render() {
    if (!this.data) return html``;

    const {
      brightId,
      auraLevel,
      auraScore,
      evaluationsReceived,
      requirements,
    } = this.data;
    const isMet = auraLevel >= this.requiredLevel;
    const nextLevel = auraLevel + 1;
    const scoreNeeded = scoreThresholds[nextLevel] ?? null;
    const hasScoreReq = scoreNeeded !== null && scoreNeeded > 0;
    const levelProgress = Math.min((auraLevel / this.requiredLevel) * 100, 100);
    const scoreProgress = hasScoreReq
      ? Math.min((auraScore / scoreNeeded!) * 100, 100)
      : 0;
    // Eval target: level 4 requires 2 evals, everything else requires 1
    const evalTarget = nextLevel >= 4 ? 2 : 1;
    const evalProgress = Math.min(
      (evaluationsReceived / evalTarget) * 100,
      100,
    );
    const needsMore = this.requiredLevel - auraLevel;
    // Show only requirements for levels the user has NOT yet reached, up to the required level
    const activeRequirements = requirements.filter(
      (r) => r.level > auraLevel && r.level <= this.requiredLevel,
    );

    return html`
      <div class="stack">
        <!-- User header -->
        <div class="user-header">
          <div class="user-info">
            ${
              userProfilePicture.get()
                ? html`<img
                    src=${userProfilePicture.get()}
                    alt="avatar"
                    class="user-avatar-img"
                  />`
                : html`
                    <div class="user-avatar">
                      ${icon('lucide:user', '', 'width: 1.25em; height: 1.25em')}
                    </div>
                  `
            }
            <div>
              <p class="user-id">
                ${userFirstName.get() + ' ' + userLastName.get()}
              </p>
              <verification-level-badge
                .level=${auraLevel ?? 0}
                size="sm"
              ></verification-level-badge>
            </div>
          </div>
          <div class="header-actions">
            <button class="edit-btn" @click=${() => this._emit('edit-profile')}>
              Edit
            </button>
            <button
              class="disconnect-btn"
              @click=${() => this._emit('disconnect')}
            >
              ${icon('mdi:shutdown', '', 'width: 20; height: 20')}
            </button>
          </div>
        </div>

        <div class="req-indicator ${isMet ? 'met' : 'unmet'}">
          ${
            isMet
              ? html`${icon('lucide:check')}`
              : html`${icon('lucide:circle-help')}`
          }
          <span
            >${
              isMet
                ? `Level ${this.requiredLevel} requirement met`
                : `Level ${this.requiredLevel} required`
            }</span
          >
        </div>

        ${
          isMet
            ? this._renderSuccess()
            : html`
                ${this._renderCurrentStep(evaluationsReceived, auraLevel)}
                ${this._renderRequirements(activeRequirements)}
                ${this._renderAskedPlayers()}
                ${this._renderProgress(
                  levelProgress,
                  scoreProgress,
                  scoreNeeded,
                  evalProgress,
                  evaluationsReceived,
                  auraLevel,
                  auraScore,
                  evalTarget,
                  hasScoreReq,
                )}
              `
        }
      </div>
    `;
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
    hasScoreReq: boolean,
  ) {
    const scoreDisplay =
      auraScore >= 1_000_000
        ? `${(auraScore / 1_000_000).toFixed(1)}M`
        : auraScore.toLocaleString();
    const scoreNeededDisplay =
      scoreNeeded !== null
        ? scoreNeeded >= 1_000_000
          ? `${(scoreNeeded / 1_000_000).toFixed(0)}M`
          : scoreNeeded.toLocaleString()
        : '—';

    return html`
      <div class="progress-section">
        <div>
          <div class="progress-row">
            <span class="progress-label">Verification Progress</span>
            <span class="progress-value"
              >Level ${auraLevel} → Level ${this.requiredLevel}</span
            >
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
            <div class="metric-header">${icon('lucide:users')} Evaluations</div>
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

          ${
            hasScoreReq
              ? html`
                  <button
                    class="metric-card"
                    @click=${() => this._emit('show-score')}
                  >
                    <div class="metric-header">
                      ${icon('lucide:trending-up')} Score
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
              : ''
          }
        </div>
      </div>
    `;
  }

  private _renderRequirements(
    activeRequirements: {
      reason: string;
      status: 'passed' | 'incomplete';
      level: number;
    }[],
  ) {
    if (activeRequirements.length === 0) return html``;

    const byLevel = new Map<
      number,
      { reason: string; status: 'passed' | 'incomplete'; level: number }[]
    >();
    for (const req of activeRequirements) {
      const arr = byLevel.get(req.level) ?? [];
      arr.push(req);
      byLevel.set(req.level, arr);
    }
    const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

    return html`
      <div class="requirements">
        ${levels.map((level) => {
          const items = byLevel.get(level)!;
          const done = items.filter((r) => r.status === 'passed').length;
          const total = items.length;
          const allDone = done === total;
          return html`
            <div class="req-group">
              <div class="req-group-header ${allDone ? 'done' : ''}">
                <span class="req-group-title">To reach Level ${level}</span>
                <span class="req-group-count ${allDone ? 'done' : ''}"
                  >${done} / ${total}</span
                >
              </div>
              <div class="req-items">
                ${items.map(
                  (req) => html`
                    <div class="req-item ${req.status}">
                      <div class="req-check ${req.status}">
                        ${
                          req.status === 'passed'
                            ? html`${icon('lucide:check')}`
                            : ''
                        }
                      </div>
                      <div class="req-reason">${req.reason}</div>
                    </div>
                  `,
                )}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _currentStepIndex(
    evaluationsReceived: number,
    auraLevel: number,
  ): 0 | 1 | 2 {
    const asked = askedEvaluationPlayers.get().length;
    if (asked === 0 && evaluationsReceived === 0) return 0;
    if (evaluationsReceived === 0) return 1;
    if (auraLevel < this.requiredLevel) return 2;
    return 2;
  }

  private _renderCurrentStep(evaluationsReceived: number, auraLevel: number) {
    const idx = this._currentStepIndex(evaluationsReceived, auraLevel);
    const steps = [
      {
        title: 'Find players who can evaluate you',
        desc: 'Import Google Contacts or share your profile link with Aura players.',
        ctaLabel: 'Find players',
        ctaIcon: 'lucide:users',
        action: () => this._emit('find-players'),
      },
      {
        title: 'Collect evaluations',
        desc: 'Waiting for evaluations. Share with more players to speed things up.',
        ctaLabel: 'Share with more',
        ctaIcon: 'lucide:share-2',
        action: () => this._emit('find-players'),
      },
      {
        title: `Reach Level ${this.requiredLevel}`,
        desc:
          evaluationsReceived > 0
            ? `You have ${evaluationsReceived} evaluation${evaluationsReceived > 1 ? 's' : ''}. Find more Aura players to get additional evaluations and boost your score.`
            : 'Find more Aura players to get evaluations and boost your score.',
        ctaLabel: 'Find more players',
        ctaIcon: 'lucide:users',
        action: () => this._emit('find-players'),
      },
    ] as const;
    const step = steps[idx];
    const pillLabel = `Step ${idx + 1} of 3`;

    return html`
      <div class="step-card">
        <div class="step-card-top">
          <span class="step-pill">
            ${icon('lucide:zap', '', 'width: 0.75em; height: 0.75em')}
            ${pillLabel}
          </span>
          <div
            class="stepper"
            role="progressbar"
            aria-valuenow=${idx + 1}
            aria-valuemax="3"
          >
            ${[0, 1, 2].map(
              (i) => html`
                <span
                  class="stepper-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"
                ></span>
              `,
            )}
          </div>
        </div>
        <h3 class="step-title">${step.title}</h3>
        <p class="step-desc">${step.desc}</p>
        <div class="step-cta">
          <button
            class="a-button"
            type="button"
            data-size="md"
            @click=${step.action}
          >
            ${icon(step.ctaIcon, 'btn-icon', 'width: 1em; height: 1em')}
            ${step.ctaLabel}
          </button>
        </div>
      </div>
    `;
  }

  private _renderSuccess() {
    return html`
      <div class="success-state">
        <div class="success-icon">
          ${icon('lucide:circle-check', '', 'width: 2em; height: 2em')}
        </div>
        <h3 class="success-title">Verification Complete</h3>
        <p class="success-desc">
          You meet the requirements for ${this.appName}
        </p>
      </div>
    `;
  }

  private _renderAskedPlayers() {
    const asked = askedEvaluationPlayers.get();
    if (!asked.length) return html``;

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const stack = asked.slice(0, 3);
    const count = asked.length;
    const expanded = this._askedExpanded;

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
              `,
            )}
          </div>
          <div class="asked-summary-text">
            <strong>${count}</strong> ${count === 1 ? 'person' : 'people'}
            waiting to evaluate you
            <span class="asked-summary-sub"
              >Tap to ${expanded ? 'hide' : 'view'}</span
            >
          </div>
          <span class="asked-chevron"> ${icon('lucide:chevron-down')} </span>
        </button>
        ${
          expanded
            ? asked.map(
                (player) => html`
                  <div class="asked-player-row">
                    <div class="asked-avatar">
                      ${
                        player.photo
                          ? html`<img src=${player.photo} alt=${player.name} />`
                          : getInitials(player.name)
                      }
                    </div>
                    <div class="asked-player-info">
                      <div class="asked-player-name">${player.name}</div>
                      <div class="asked-player-sub">
                        ${icon('lucide:clock')} Waiting for evaluation
                      </div>
                    </div>
                    <span class="asked-status-badge waiting">
                      ${icon('lucide:hourglass')} Waiting
                    </span>
                  </div>
                `,
              )
            : ''
        }
      </div>
    `;
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true, detail }),
    );
  }
}
