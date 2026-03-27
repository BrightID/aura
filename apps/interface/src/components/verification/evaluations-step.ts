import { foundAuraPlayersFromContact } from '@/lib/data/contacts'
import type { AuraImpact } from '@/types/evaluation'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High'
}

@customElement('verification-evaluations')
export class VerificationEvaluationsElement extends SignalWatcher(LitElement) {
  @property({ type: Array }) impacts: AuraImpact[] = []

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: 1.25em;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75em;
    }
    .back-btn {
      padding: 0.375em;
      margin-left: -0.375em;
      border-radius: 0.5em;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .back-btn:hover {
      background: var(--secondary);
    }
    .back-btn iconify-icon {
      width: 1.25em;
      height: 1.25em;
    }
    .title {
      margin: 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
    }
    .count-pill {
      margin-left: auto;
      font-size: 0.7em;
      color: var(--muted-foreground);
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 9999px;
      padding: 0.2em 0.65em;
    }

    /* List */
    .evaluator-list {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
    }
    .evaluator-card {
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.75em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
    }

    /* Avatar */
    .avatar {
      width: 2.5em;
      height: 2.5em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8em;
      font-weight: 700;
      color: var(--primary);
      flex-shrink: 0;
      letter-spacing: -0.02em;
    }
    .avatar.contact {
      background: rgba(34, 197, 94, 0.12);
      color: var(--aura-success, #22c55e);
    }

    /* Info */
    .info {
      flex: 1;
      min-width: 0;
    }
    .name {
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin-top: 0.25em;
      flex-wrap: wrap;
    }
    .contact-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
      font-size: 0.7em;
      color: var(--aura-success, #22c55e);
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 9999px;
      padding: 0.15em 0.5em;
    }
    .contact-badge iconify-icon {
      width: 0.7em;
      height: 0.7em;
    }
    .level-label {
      font-size: 0.75em;
      color: var(--muted-foreground);
    }
    .profile-link {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
      font-size: 0.75em;
      color: var(--primary);
      text-decoration: none;
      transition: opacity 0.15s;
    }
    .profile-link:hover {
      opacity: 0.75;
    }
    .profile-link iconify-icon {
      width: 0.7em;
      height: 0.7em;
    }

    /* Right side */
    .right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2em;
      flex-shrink: 0;
    }
    .impact {
      font-size: 0.8em;
      font-weight: 600;
      color: var(--foreground);
    }
    .confidence {
      font-size: 0.7em;
      color: var(--muted-foreground);
    }

    .empty {
      text-align: center;
      padding: 2.5em 1em;
      color: var(--muted-foreground);
      font-size: 0.875em;
    }
  `

  protected render() {
    const contacts = foundAuraPlayersFromContact.get()
    const sorted = [...this.impacts].sort((a, b) => b.impact - a.impact)

    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <h2 class="title">Evaluators</h2>
          <span class="count-pill">${this.impacts.length}</span>
        </div>

        ${sorted.length === 0
          ? html`<div class="empty">No evaluations received yet</div>`
          : html`
              <div class="evaluator-list">
                ${sorted.map((impact) => {
                  const contact = contacts.find((c) => c.value === impact.evaluator)
                  const initials = contact
                    ? contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : impact.evaluator.slice(0, 2).toUpperCase()
                  const displayName = contact
                    ? contact.name
                    : `${impact.evaluator.slice(0, 8)}…${impact.evaluator.slice(-4)}`
                  const impactDisplay =
                    impact.impact >= 1_000_000
                      ? `${(impact.impact / 1_000_000).toFixed(1)}M`
                      : impact.impact.toLocaleString()
                  const confidenceLabel =
                    CONFIDENCE_LABELS[impact.confidence] ?? `${impact.confidence}`

                  return html`
                    <div class="evaluator-card">
                      <div class="avatar ${contact ? 'contact' : ''}">${initials}</div>
                      <div class="info">
                        <div class="name">${displayName}</div>
                        <div class="sub">
                          ${contact
                            ? html`
                                <span class="contact-badge">
                                  <iconify-icon icon="lucide:user-check"></iconify-icon>
                                  In contacts
                                </span>
                              `
                            : html`
                                ${impact.level != null
                                  ? html`<span class="level-label">Level ${impact.level}</span>`
                                  : ''}
                                <a
                                  class="profile-link"
                                  href="https://aura-dev.vercel.app/subject/${encodeURIComponent(impact.evaluator)}/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View profile
                                  <iconify-icon icon="lucide:external-link"></iconify-icon>
                                </a>
                              `}
                        </div>
                      </div>
                      <div class="right">
                        <span class="impact">+${impactDisplay}</span>
                        <span class="confidence">${confidenceLabel} conf.</span>
                      </div>
                    </div>
                  `
                })}
              </div>
            `}
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
