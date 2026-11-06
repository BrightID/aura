import { LightElement } from '../light-element';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './shared-styles.css';
import './level-badge.css';

const levelColors: Record<
  number,
  { bg: string; text: string; border: string }
> = {
  0: {
    bg: 'var(--muted)',
    text: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
  1: {
    bg: 'rgba(251, 191, 36, 0.15)',
    text: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  2: {
    bg: 'rgba(96, 165, 250, 0.15)',
    text: 'var(--aura-info)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  3: {
    bg: 'rgba(74, 222, 128, 0.15)',
    text: 'var(--aura-success)',
    border: 'rgba(74, 222, 128, 0.3)',
  },
  4: {
    bg: 'rgba(167, 139, 250, 0.15)',
    text: '#a78bfa',
    border: 'rgba(167, 139, 250, 0.3)',
  },
};

const levelLabels: Record<number, string> = {
  0: 'Not Verified',
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
  4: 'Level 4',
};

@customElement('verification-level-badge')
export class VerificationLevelBadge extends LightElement {
  @property({ type: Number }) level = 0;
  @property() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  render() {
    const level = Math.max(0, Math.min(4, this.level));
    const colors = levelColors[level] ?? levelColors[0]!;
    const label = levelLabels[level] ?? 'Unknown';

    return html`
      <span
        class="badge ${this.size}"
        style="background: ${colors.bg}; color: ${colors.text}; border-color: ${colors.border}"
      >
        <span class="dot"></span>
        ${label}
      </span>
    `;
  }
}
