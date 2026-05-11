import { SignalWatcher } from '@lit-labs/signals'
import { type CSSResultGroup, css, html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { askedEvaluationPlayers, foundAuraPlayersFromContact } from '@/lib/data/contacts'
import type { AuraImpact } from '@/types/evaluation'

const SLICE_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#ef4444',
  '#64748b'
]

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High'
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlicePath(
  cx: number,
  cy: number,
  r: number,
  ri: number,
  startAngle: number,
  endAngle: number
): string {
  const so = polarToCartesian(cx, cy, r, startAngle)
  const eo = polarToCartesian(cx, cy, r, endAngle)
  const ei = polarToCartesian(cx, cy, ri, endAngle)
  const si = polarToCartesian(cx, cy, ri, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  const fmt = (n: number) => n.toFixed(3)
  return [
    `M ${fmt(so.x)} ${fmt(so.y)}`,
    `A ${r} ${r} 0 ${large} 1 ${fmt(eo.x)} ${fmt(eo.y)}`,
    `L ${fmt(ei.x)} ${fmt(ei.y)}`,
    `A ${ri} ${ri} 0 ${large} 0 ${fmt(si.x)} ${fmt(si.y)}`,
    'Z'
  ].join(' ')
}

@customElement('verification-score')
export class VerificationScoreElement extends SignalWatcher(LitElement) {
  @property({ type: Array }) impacts: AuraImpact[] = []
  @property({ type: Number }) totalScore = 0

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
      padding-bottom: 10px;
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
      padding: 0.5em;
      margin-left: -0.5em;
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
      width: 1.5em;
      height: 1.5em;
    }
    .title {
      margin: 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
    }

    /* Chart */
    .chart-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1em;
    }
    .chart-svg {
      width: 10em;
      height: 10em;
      overflow: visible;
    }

    /* Breakdown list */
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 0.375em;
    }
    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.625em 0.75em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 0.5em;
    }
    .color-dot {
      width: 0.6em;
      height: 0.6em;
      border-radius: 9999px;
      flex-shrink: 0;
    }
    .bi-name {
      flex: 1;
      min-width: 0;
      font-size: 0.8em;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bi-conf {
      font-size: 0.7em;
      color: var(--muted-foreground);
      flex-shrink: 0;
    }
    .bi-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.1em;
      flex-shrink: 0;
    }
    .bi-amount {
      font-size: 0.8em;
      font-weight: 600;
      color: var(--foreground);
    }
    .bi-pct {
      font-size: 0.7em;
      color: var(--muted-foreground);
    }

    .empty {
      text-align: center;
      padding: 2.5em 1em;
      color: var(--muted-foreground);
      font-size: 0.875em;
    }

    /* Pending rows */
    .pending-label {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 0.7em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25em;
    }
    .pending-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .pending-label iconify-icon {
      width: 0.8em;
      height: 0.8em;
      flex-shrink: 0;
    }
    .breakdown-item.pending {
      opacity: 0.65;
    }
    .bi-amount.zero {
      color: var(--muted-foreground);
    }
  `

  protected render() {
    const contacts = foundAuraPlayersFromContact.get()
    const sorted = [...this.impacts].sort((a, b) => b.impact - a.impact)
    const total = sorted.reduce((sum, i) => sum + i.impact, 0) || 1
    const asked = askedEvaluationPlayers.get()
    const evaluatorSet = new Set(this.impacts.map((i) => i.evaluator))
    const pending = asked.filter((p) => !evaluatorSet.has(p.value))
    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const CX = 50,
      CY = 50,
      R = 43,
      RI = 27
    const GAP = sorted.length > 1 ? 1.5 : 0

    let angle = 0
    const slices = sorted.map((impact, idx) => {
      const fraction = impact.impact / total
      const sweep = fraction * 360
      const start = angle + GAP / 2
      const end = angle + sweep - GAP / 2
      angle += sweep
      const color = SLICE_COLORS[idx % SLICE_COLORS.length]
      const contact = contacts.find((c) => c.value === impact.evaluator)
      const name = contact ? contact.name : `${impact.evaluator.slice(0, 8)}…`
      return {
        impact,
        fraction,
        color,
        path: donutSlicePath(CX, CY, R, RI, start, end),
        name
      }
    })

    const totalDisplay =
      total >= 1_000_000
        ? `${(total / 1_000_000).toFixed(1)}M`
        : total >= 1_000
          ? `${(total / 1_000).toFixed(0)}K`
          : total.toLocaleString()

    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <h2 class="title">Score Breakdown</h2>
        </div>

        ${sorted.length === 0 && pending.length === 0
          ? html`<div class="empty">No score data yet</div>`
          : html`
              <div class="chart-section">
                <svg class="chart-svg" viewBox="0 0 100 100">
                  ${slices.length === 1
                    ? svg`
                        <circle cx="${CX}" cy="${CY}" r="${R}" fill="${slices[0]?.color}" />
                        <circle cx="${CX}" cy="${CY}" r="${RI}" style="fill: var(--card, #fff)" />
                      `
                    : slices.map((s) => svg`<path d="${s.path}" fill="${s.color}" />`)}
                  <text
                    x="${CX}"
                    y="${CY - 4}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    style="font-size: 9px; font-weight: 700; fill: var(--foreground)"
                  >
                    ${totalDisplay}
                  </text>
                  <text
                    x="${CX}"
                    y="${CY + 8}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    style="font-size: 5.5px; fill: var(--muted-foreground, #888)"
                  >
                    total score
                  </text>
                </svg>
              </div>

              <div class="breakdown-list">
                ${slices.map(({ impact, fraction, color, name }) => {
                  const impactDisplay =
                    impact.impact >= 1_000_000
                      ? `+${(impact.impact / 1_000_000).toFixed(1)}M`
                      : `+${impact.impact.toLocaleString()}`
                  const pct = (fraction * 100).toFixed(1)
                  const conf = CONFIDENCE_LABELS[impact.confidence] ?? `${impact.confidence}`

                  return html`
                    <div class="breakdown-item">
                      <div class="color-dot" style="background: ${color}"></div>
                      <span class="bi-name">${name}</span>
                      <span class="bi-conf">${conf}</span>
                      <div class="bi-right">
                        <span class="bi-amount">${impactDisplay}</span>
                        <span class="bi-pct">${pct}%</span>
                      </div>
                    </div>
                  `
                })}
                ${pending.length > 0
                  ? html`
                      <span class="pending-label">
                        <iconify-icon icon="lucide:clock"></iconify-icon>
                        Waiting for evaluation
                      </span>
                      ${pending.map(
                        (player) => html`
                          <div class="breakdown-item pending">
                            <div class="color-dot" style="background: var(--border)"></div>
                            <span class="bi-name">${player.name}</span>
                            <span class="bi-conf">Pending</span>
                            <div class="bi-right">
                              <span class="bi-amount zero">+0</span>
                              <span class="bi-pct">0%</span>
                            </div>
                          </div>
                        `
                      )}
                    `
                  : ''}
              </div>
            `}
      </div>
    `
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
