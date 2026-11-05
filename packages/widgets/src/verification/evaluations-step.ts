import { icon } from '../icon';
import { LightElement } from '../light-element';
import {
  askedEvaluationPlayers,
  foundAuraPlayersFromContact,
} from '@/lib/data/contacts';
import type { AuraImpact } from '@/types/evaluation';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CORE_APP_URL } from './constants';
import './shared-styles.css';
import './evaluations-step.css';

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High',
};

@customElement('verification-evaluations')
export class VerificationEvaluationsElement extends SignalWatcher(
  LightElement,
) {
  @property({ type: Array }) impacts: AuraImpact[] = [];

  protected render() {
    const contacts = foundAuraPlayersFromContact.get();
    const sorted = [...this.impacts].sort((a, b) => b.impact - a.impact);
    const asked = askedEvaluationPlayers.get();
    const evaluatorSet = new Set(this.impacts.map((i) => i.evaluator));
    // pending = asked players not yet in actual impacts (value is email/phone, never matches evaluator BrightID)
    const pending = asked.filter((p) => !evaluatorSet.has(p.value));

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return html`
      <div class="stack">
        <div class="page-header">
          <button
            class="back-btn"
            aria-label="Go back"
            @click=${() => this._emit('back')}
          >
            ${icon('lucide:chevron-left')}
          </button>
          <h2 class="title">Evaluators</h2>
          <span class="count-pill"
            >${this.impacts.length + pending.length}</span
          >
        </div>

        ${
          sorted.length === 0 && pending.length === 0
            ? html`<div class="empty">No evaluations received yet</div>`
            : html`
                <div class="evaluator-list">
                  ${sorted.map((impact) => {
                    const contact = contacts.find(
                      (c) => c.value === impact.evaluator,
                    );
                    const initials = contact
                      ? contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : impact.evaluator.slice(0, 2).toUpperCase();
                    const displayName = contact
                      ? contact.name
                      : `${impact.evaluator.slice(0, 8)}…${impact.evaluator.slice(-4)}`;
                    const impactDisplay =
                      impact.impact >= 1_000_000
                        ? `${(impact.impact / 1_000_000).toFixed(1)}M`
                        : impact.impact.toLocaleString();
                    const confidenceLabel =
                      CONFIDENCE_LABELS[impact.confidence] ??
                      `${impact.confidence}`;

                    return html`
                      <div class="evaluator-card">
                        <div class="avatar ${contact ? 'contact' : ''}">
                          ${initials}
                        </div>
                        <div class="info">
                          <div class="name">${displayName}</div>
                          <div class="sub">
                            ${
                              contact
                                ? html`
                                    <span class="contact-badge">
                                      ${icon('lucide:user-check')} In contacts
                                    </span>
                                  `
                                : html`
                                    ${
                                      impact.level != null
                                        ? html`<span class="level-label"
                                            >Level ${impact.level}</span
                                          >`
                                        : ''
                                    }
                                    <a
                                      class="profile-link"
                                      href="${CORE_APP_URL}/subject/${encodeURIComponent(impact.evaluator)}/"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View profile
                                      ${icon('lucide:external-link')}
                                    </a>
                                  `
                            }
                          </div>
                        </div>
                        <div class="right">
                          <span class="impact">+${impactDisplay}</span>
                          <span class="confidence"
                            >${confidenceLabel} conf.</span
                          >
                        </div>
                      </div>
                    `;
                  })}
                  ${
                    pending.length > 0
                      ? html`
                          <span class="pending-label">
                            ${icon('lucide:clock')} Waiting for evaluation
                          </span>
                          ${pending.map(
                            (player) => html`
                              <div class="evaluator-card">
                                <div class="avatar pending">
                                  ${getInitials(player.name)}
                                </div>
                                <div class="info">
                                  <div class="name">${player.name}</div>
                                  <div class="sub">
                                    <span class="pending-badge">
                                      ${icon('lucide:hourglass')} Asked
                                    </span>
                                  </div>
                                </div>
                                <div class="right">
                                  <span class="impact zero">0</span>
                                  <span class="confidence">Pending</span>
                                </div>
                              </div>
                            `,
                          )}
                        `
                      : ''
                  }
                </div>
              `
        }
      </div>
    `;
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
