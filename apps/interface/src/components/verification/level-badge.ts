import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const levelColors: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'var(--muted)', text: 'var(--muted-foreground)', border: 'var(--border)' },
  1: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  2: { bg: 'rgba(96, 165, 250, 0.15)', text: 'var(--aura-info)', border: 'rgba(96, 165, 250, 0.3)' },
  3: { bg: 'rgba(74, 222, 128, 0.15)', text: 'var(--aura-success)', border: 'rgba(74, 222, 128, 0.3)' },
}

const levelLabels: Record<number, string> = {
  0: 'Not Verified',
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
}

@customElement('verification-level-badge')
export class VerificationLevelBadge extends LitElement {
  @property({ type: Number }) level = 0
  @property() size: 'xs' | 'sm' | 'md' | 'lg' = 'md'

  static styles: CSSResultGroup = css`
    :host { display: inline-flex; font-size: inherit; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375em;
      border-radius: 9999px;
      font-weight: 500;
      border: 1px solid;
      /* md defaults */
      padding: 0.25em 0.75em;
      font-size: 0.875em;
    }
    .badge.xs { padding: 0.125em 0.375em; font-size: 0.625em; gap: 0.25em; }
    .badge.sm { padding: 0.125em 0.5em;   font-size: 0.75em; }
    .badge.lg { padding: 0.375em 1em;     font-size: 1em; }

    .dot {
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
      /* md default */
      width: 0.5em;
      height: 0.5em;
    }
    .badge.xs .dot { width: 0.25em;  height: 0.25em; }
    .badge.sm .dot { width: 0.375em; height: 0.375em; }
    .badge.lg .dot { width: 0.625em; height: 0.625em; }
  `

  render() {
    const level = Math.max(0, Math.min(3, this.level))
    const colors = levelColors[level] ?? levelColors[0]!
    const label = levelLabels[level] ?? 'Unknown'

    return html`
      <span
        class="badge ${this.size}"
        style="background: ${colors.bg}; color: ${colors.text}; border-color: ${colors.border}"
      >
        <span class="dot"></span>
        ${label}
      </span>
    `
  }
}
