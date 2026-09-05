import { css, type CSSResultGroup, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

type Step =
  | 'intro'
  | 'connect'
  | 'progress'
  | 'success'
  | 'how-it-works'
  | 'find-players';

/* ── SVG helpers ─────────────────────────────────── */
const svgUser = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>`;
const svgCheck = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polyline points="20 6 9 17 4 12" />
</svg>`;
const svgChevronLeft = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polyline points="15 18 9 12 15 6" />
</svg>`;
const svgUsers = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
</svg>`;
const svgTrending = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  <polyline points="17 6 23 6 23 12" />
</svg>`;
const svgZap = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
</svg>`;
const svgLink = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
</svg>`;
const svgLock = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>`;
const svgBadgeCheck = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <polyline points="9 12 11 14 15 10" />
</svg>`;
const svgLockOpen = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
</svg>`;
const svgShare = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="18" cy="5" r="3" />
  <circle cx="6" cy="12" r="3" />
  <circle cx="18" cy="19" r="3" />
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
</svg>`;
const svgMail = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path
    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
  />
  <polyline points="22,6 12,13 2,6" />
</svg>`;
const svgPower = html`<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
  <line x1="12" y1="2" x2="12" y2="12" />
</svg>`;

/* ── Level badge utils ───────────────────────────── */
const LEVEL_COLORS: Record<
  number,
  { bg: string; text: string; border: string }
> = {
  0: {
    bg: 'var(--muted)',
    text: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
  1: {
    bg: 'rgba(251,191,36,0.15)',
    text: '#fbbf24',
    border: 'rgba(251,191,36,0.3)',
  },
  2: {
    bg: 'rgba(96,165,250,0.15)',
    text: 'var(--aura-info,#60a5fa)',
    border: 'rgba(96,165,250,0.3)',
  },
  3: {
    bg: 'rgba(74,222,128,0.15)',
    text: 'var(--aura-success,#4ade80)',
    border: 'rgba(74,222,128,0.3)',
  },
};
const LEVEL_LABELS: Record<number, string> = {
  0: 'Not Verified',
  1: 'Level 1',
  2: 'Level 2',
  3: 'Level 3',
};

function levelBadge(level: number, size: 'sm' | 'md' | 'lg' = 'md') {
  const c = LEVEL_COLORS[Math.max(0, Math.min(3, level))] ?? LEVEL_COLORS[0]!;
  const label = LEVEL_LABELS[Math.max(0, Math.min(3, level))] ?? 'Unknown';
  const pad =
    size === 'sm'
      ? '0.125em 0.5em'
      : size === 'lg'
        ? '0.375em 1em'
        : '0.25em 0.75em';
  const fs = size === 'sm' ? '0.75em' : size === 'lg' ? '1em' : '0.875em';
  const dot = size === 'sm' ? '0.375em' : size === 'lg' ? '0.625em' : '0.5em';
  return html`
    <span
      style="
      display: inline-flex; align-items: center; gap: 0.375em;
      border-radius: 9999px; font-weight: 500; border: 1px solid;
      padding: ${pad}; font-size: ${fs};
      background: ${c!.bg}; color: ${c!.text}; border-color: ${c!.border};
    "
    >
      <span
        style="width:${dot};height:${dot};border-radius:50%;background:currentColor;flex-shrink:0;"
      ></span>
      ${label}
    </span>
  `;
}

@customElement('aura-preview-frame')
export class AuraPreviewFrame extends LitElement {
  /* ── App config ─── */
  @property() appName = 'My App';
  @property() appDescription =
    'Verify your identity to access exclusive features.';
  @property() appLogo = '';
  @property({ type: Number }) requiredLevel = 2;
  /* ── User state ─── */
  @property({ type: Boolean }) isConnected = false;
  @property({ type: Number }) currentLevel = 0;
  @property({ type: Number }) auraScore = 0;
  @property({ type: Number }) evaluationsReceived = 0;
  @property({ type: Number }) evaluationsNeeded = 3;
  @property({ type: Number }) score = 0;
  @property({ type: Number }) scoreNeeded = 100;
  @property() userName = 'Aura User';
  @property() userAvatar = '';
  /* ── Display ─────── */
  @property({ type: Boolean }) testMode = false;

  @state() private _step: Step = 'intro';
  @state() private _prevStep: Step = 'intro';

  /* Sync step when externally-controlled props change */
  updated(changed: Map<string, unknown>) {
    if (
      !changed.has('isConnected') &&
      !changed.has('currentLevel') &&
      !changed.has('requiredLevel')
    )
      return;
    this._syncStep();
  }

  firstUpdated() {
    this._syncStep();
  }

  private _syncStep() {
    if (!this.isConnected) {
      if (this._step !== 'how-it-works') this._step = 'intro';
      return;
    }
    if (!['how-it-works', 'find-players'].includes(this._step)) {
      this._step =
        this.currentLevel >= this.requiredLevel ? 'success' : 'progress';
    }
  }

  private _go(step: Step) {
    this._prevStep = this._step;
    this._step = step;
  }

  /* Preview-mode connect: advance to the right step */
  private _simulateConnect() {
    this._go(this.currentLevel >= this.requiredLevel ? 'success' : 'progress');
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: 1rem;
      font-family: inherit;
    }

    /* ── Frame shell ──────────────── */
    .frame {
      width: 100%;
      max-width: 24rem;
      border-radius: var(--radius, 0.75rem);
      overflow: hidden;
      border: 1px solid var(--border, #3a3a5c);
      background: var(--card, #1e1e36);
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }
    .test-ribbon {
      position: absolute;
      top: 12px;
      right: -28px;
      background: var(--aura-warning, #f59e0b);
      color: #000;
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 32px;
      transform: rotate(45deg);
      z-index: 10;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }
    .content {
      padding: 1.25rem;
      padding-bottom: calc(1.25rem + 44px);
      min-height: 300px;
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.625rem 1.25rem;
      border-top: 1px solid var(--border, #3a3a5c);
      background: var(--muted, #1a1a30);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
    }
    .footer svg {
      width: 0.875rem;
      height: 0.875rem;
      flex-shrink: 0;
    }
    .footer a {
      color: var(--primary, #7c3aed);
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }

    /* ── Shared layout ────────────── */
    .stack {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.625rem 1.25rem;
      border-radius: calc(var(--radius, 0.75rem) - 0.25rem);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition:
        opacity 0.15s,
        background 0.15s;
      font-family: inherit;
    }
    .btn svg {
      width: 1.125rem;
      height: 1.125rem;
      flex-shrink: 0;
    }
    .btn-primary {
      background: var(--primary, #7c3aed);
      color: var(--primary-foreground, #fff);
    }
    .btn-primary:hover {
      opacity: 0.88;
    }
    .btn-secondary {
      background: var(--secondary, #2d2d50);
      color: var(--secondary-foreground, #d1d1e8);
      border: 1px solid var(--border, #3a3a5c);
    }
    .btn-secondary:hover {
      opacity: 0.85;
    }
    .btn-ghost {
      background: transparent;
      color: var(--muted-foreground, #8888aa);
      font-size: 0.875rem;
      padding: 0.375rem 0;
    }
    .btn-ghost:hover {
      color: var(--foreground, #fff);
    }

    /* ── Intro step ───────────────── */
    .app-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .app-logo {
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      background: var(--secondary, #2d2d50);
      border: 1px solid var(--border, #3a3a5c);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .app-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .app-logo svg {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--muted-foreground, #8888aa);
    }
    .app-name {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }
    .app-desc {
      margin: 0.25rem 0 0;
      font-size: 0.8125rem;
      color: var(--muted-foreground, #8888aa);
      line-height: 1.5;
    }

    .level-req-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      background: var(--secondary, #2d2d50);
      border-radius: 0.625rem;
      border: 1px solid var(--border, #3a3a5c);
    }
    .level-req-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--primary, #7c3aed) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .level-req-icon svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--primary, #7c3aed);
    }
    .level-req-label {
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
      margin: 0;
    }
    .level-req-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--foreground, #fff);
      margin: 0.125rem 0 0;
    }

    /* ── Connect step ─────────────── */
    .connect-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
    }
    .connect-icon {
      width: 4rem;
      height: 4rem;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary, #7c3aed) 10%, transparent);
      border: 1px solid
        color-mix(in srgb, var(--primary, #7c3aed) 25%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .connect-icon svg {
      width: 2rem;
      height: 2rem;
      color: var(--primary, #7c3aed);
    }
    .connect-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }
    .connect-sub {
      margin: 0;
      font-size: 0.875rem;
      color: var(--muted-foreground, #8888aa);
    }

    .connect-methods {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .connect-method {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--border, #3a3a5c);
      border-radius: 0.625rem;
      background: var(--secondary, #2d2d50);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition:
        border-color 0.15s,
        background 0.15s;
      width: 100%;
    }
    .connect-method:hover {
      border-color: var(--primary, #7c3aed);
      background: color-mix(
        in srgb,
        var(--primary, #7c3aed) 5%,
        var(--secondary, #2d2d50)
      );
    }
    .connect-method-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--primary, #7c3aed) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .connect-method-icon svg {
      width: 1.125rem;
      height: 1.125rem;
      color: var(--primary, #7c3aed);
    }
    .connect-method-name {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground, #fff);
    }
    .connect-method-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
    }

    /* ── Progress step ────────────── */
    .user-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary, #7c3aed) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .user-avatar svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--primary, #7c3aed);
    }
    .user-name {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground, #fff);
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground, #8888aa);
      padding: 0.25rem;
      display: flex;
      border-radius: 0.375rem;
      transition:
        color 0.15s,
        background 0.15s;
      font-family: inherit;
    }
    .icon-btn:hover {
      color: var(--foreground, #fff);
      background: var(--secondary, #2d2d50);
    }
    .icon-btn svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    .req-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      border: 1px solid;
    }
    .req-indicator svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
    .req-met {
      background: rgba(74, 222, 128, 0.1);
      color: var(--aura-success, #4ade80);
      border-color: rgba(74, 222, 128, 0.2);
    }
    .req-unmet {
      background: var(--secondary, #2d2d50);
      color: var(--muted-foreground, #8888aa);
      border-color: var(--border, #3a3a5c);
    }

    .step-card {
      padding: 0.875rem;
      background: color-mix(
        in srgb,
        var(--primary, #7c3aed) 6%,
        var(--secondary, #2d2d50)
      );
      border: 1px solid
        color-mix(in srgb, var(--primary, #7c3aed) 22%, transparent);
      border-radius: 0.625rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .step-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .step-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3em;
      padding: 0.2em 0.55em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary, #7c3aed) 18%, transparent);
      border: 1px solid
        color-mix(in srgb, var(--primary, #7c3aed) 32%, transparent);
      font-size: 0.625em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary, #7c3aed);
    }
    .step-pill svg {
      width: 0.75em;
      height: 0.75em;
    }
    .stepper {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .stepper-dot {
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 9999px;
      background: color-mix(
        in srgb,
        var(--muted-foreground, #8888aa) 35%,
        transparent
      );
      transition:
        background 0.2s,
        transform 0.2s;
    }
    .stepper-dot.done {
      background: var(--aura-success, #4ade80);
    }
    .stepper-dot.active {
      background: var(--primary, #7c3aed);
      transform: scale(1.5);
    }
    .step-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }
    .step-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
      line-height: 1.5;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .metric-card {
      padding: 0.75rem;
      background: var(--secondary, #2d2d50);
      border-radius: 0.5rem;
      cursor: pointer;
      border: 1px solid transparent;
      font-family: inherit;
      text-align: left;
      width: 100%;
      transition: border-color 0.15s;
    }
    .metric-card:hover {
      border-color: var(--border, #3a3a5c);
    }
    .metric-card.full {
      grid-column: 1 / -1;
    }
    .metric-label {
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
      margin: 0 0 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .metric-label svg {
      width: 0.875rem;
      height: 0.875rem;
    }
    .metric-val {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }
    .metric-sub {
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
    }
    .metric-bar {
      height: 0.25rem;
      background: var(--muted, #1a1a30);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .metric-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.4s;
    }

    /* ── Success step ─────────────── */
    .success-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding: 0.5rem 0;
      text-align: center;
    }
    .success-ring {
      position: relative;
      width: 5rem;
      height: 5rem;
    }
    .ring-pulse {
      position: absolute;
      inset: 0;
      border-radius: 9999px;
      background: rgba(74, 222, 128, 0.2);
      animation: ring-pulse 1.5s ease-out infinite;
    }
    @keyframes ring-pulse {
      0% {
        transform: scale(0.9);
        opacity: 1;
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
      }
    }
    .ring-inner {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      background: rgba(74, 222, 128, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ring-inner svg {
      width: 2.5rem;
      height: 2.5rem;
      color: var(--aura-success, #4ade80);
    }
    .success-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }
    .success-desc {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--muted-foreground, #8888aa);
    }
    .level-card {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: var(--secondary, #2d2d50);
      border-radius: var(--radius, 0.75rem);
    }
    .level-label-text {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.075em;
      color: var(--muted-foreground, #8888aa);
      font-weight: 500;
    }
    .footnote {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
    }

    /* ── How it works ─────────────── */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .back-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      margin-left: -0.5rem;
      border-radius: 0.5rem;
      color: var(--muted-foreground, #8888aa);
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.15s,
        color 0.15s;
      font-family: inherit;
    }
    .back-btn:hover {
      background: var(--secondary, #2d2d50);
      color: var(--foreground, #fff);
    }
    .back-btn svg {
      width: 1.5rem;
      height: 1.5rem;
    }
    .page-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--foreground, #fff);
    }

    .hiw-steps {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .hiw-step {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--secondary, #2d2d50);
      border-radius: 0.5rem;
    }
    .hiw-icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--primary, #7c3aed) 10%, transparent);
      color: var(--primary, #7c3aed);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .hiw-icon svg {
      width: 1.125rem;
      height: 1.125rem;
    }
    .hiw-step-title {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground, #fff);
    }
    .hiw-step-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
      line-height: 1.5;
    }

    .privacy-note {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem;
      background: color-mix(in srgb, var(--aura-info, #60a5fa) 5%, transparent);
      border: 1px solid
        color-mix(in srgb, var(--aura-info, #60a5fa) 20%, transparent);
      border-radius: 0.5rem;
    }
    .privacy-note svg {
      width: 1rem;
      height: 1rem;
      color: var(--aura-info, #60a5fa);
      flex-shrink: 0;
      margin-top: 0.125rem;
    }
    .privacy-heading {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--aura-info, #60a5fa);
    }
    .privacy-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
      line-height: 1.5;
    }

    /* ── Find players ─────────────── */
    .find-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .find-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--border, #3a3a5c);
      border-radius: 0.625rem;
      background: var(--secondary, #2d2d50);
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: border-color 0.15s;
      width: 100%;
    }
    .find-option:hover {
      border-color: var(--primary, #7c3aed);
    }
    .find-option-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--primary, #7c3aed) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .find-option-icon svg {
      width: 1.125rem;
      height: 1.125rem;
      color: var(--primary, #7c3aed);
    }
    .find-option-name {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground, #fff);
    }
    .find-option-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--muted-foreground, #8888aa);
    }

    .empty-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      text-align: center;
      color: var(--muted-foreground, #8888aa);
      font-size: 0.8125rem;
    }
    .empty-hint svg {
      width: 2rem;
      height: 2rem;
      opacity: 0.4;
    }
  `;

  protected render() {
    return html`
      <div class="frame">
        ${this.testMode ? html`<div class="test-ribbon">TEST</div>` : ''}
        <div class="content">${this._renderStep()}</div>
        <div class="footer">
          ${svgLock}
          <span>Secured by Aura Network</span>
          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noopener noreferrer"
            >Learn more</a
          >
        </div>
      </div>
    `;
  }

  private _renderStep() {
    switch (this._step) {
      case 'intro':
        return this._renderIntro();
      case 'connect':
        return this._renderConnect();
      case 'progress':
        return this._renderProgress();
      case 'success':
        return this._renderSuccess();
      case 'how-it-works':
        return this._renderHowItWorks();
      case 'find-players':
        return this._renderFindPlayers();
    }
  }

  /* ── Intro ──────────────────────────────────────── */
  private _renderIntro() {
    return html`
      <div class="stack">
        <div class="app-header">
          <div class="app-logo">
            ${
              this.appLogo
                ? html`<img src=${this.appLogo} alt=${this.appName} />`
                : svgUsers
            }
          </div>
          <div>
            <h2 class="app-name">${this.appName}</h2>
            <p class="app-desc">${this.appDescription}</p>
          </div>
        </div>

        <div class="level-req-card">
          <div class="level-req-icon">${svgBadgeCheck}</div>
          <div>
            <p class="level-req-label">Verification required</p>
            <p class="level-req-title">
              Aura
              ${LEVEL_LABELS[this.requiredLevel] ?? `Level ${this.requiredLevel}`}
            </p>
          </div>
          ${levelBadge(this.requiredLevel, 'sm')}
        </div>

        <button class="btn btn-primary" @click=${() => this._go('connect')}>
          ${svgLink} Get Verified
        </button>

        <button class="btn btn-ghost" @click=${() => this._go('how-it-works')}>
          How does this work?
        </button>
      </div>
    `;
  }

  /* ── Connect ────────────────────────────────────── */
  private _renderConnect() {
    return html`
      <div class="stack">
        <div class="connect-header">
          <div class="connect-icon">${svgLink}</div>
          <h2 class="connect-title">Connect your identity</h2>
          <p class="connect-sub">
            Link your BrightID to verify your uniqueness
          </p>
        </div>

        <div class="connect-methods">
          <button
            class="connect-method"
            @click=${() => this._simulateConnect()}
          >
            <div class="connect-method-icon">${svgBadgeCheck}</div>
            <div>
              <p class="connect-method-name">BrightID</p>
              <p class="connect-method-desc">Scan QR code with BrightID app</p>
            </div>
          </button>
          <button
            class="connect-method"
            @click=${() => this._simulateConnect()}
          >
            <div class="connect-method-icon">${svgLink}</div>
            <div>
              <p class="connect-method-name">Wallet</p>
              <p class="connect-method-desc">
                Connect with MetaMask or WalletConnect
              </p>
            </div>
          </button>
        </div>

        <button class="btn btn-ghost" @click=${() => this._go('intro')}>
          ← Back
        </button>
      </div>
    `;
  }

  /* ── Progress ───────────────────────────────────── */
  private _renderProgress() {
    const isMet = this.currentLevel >= this.requiredLevel;
    const evalPct = Math.min(
      100,
      (this.evaluationsReceived / Math.max(1, this.evaluationsNeeded)) * 100,
    );
    const scorePct = Math.min(
      100,
      this.scoreNeeded > 0 ? (this.score / this.scoreNeeded) * 100 : 0,
    );

    const stepIdx =
      this.evaluationsReceived === 0
        ? 0
        : this.currentLevel < this.requiredLevel
          ? 1
          : 2;
    const steps = [
      {
        title: 'Find players who can evaluate you',
        desc: 'Import contacts or share your profile link with Aura players.',
        cta: 'Find players',
        action: () => this._go('find-players'),
      },
      {
        title: 'Collect evaluations',
        desc: 'Waiting for evaluations. Share with more players to speed things up.',
        cta: 'Share with more',
        action: () => this._go('find-players'),
      },
      {
        title: `Reach Level ${this.requiredLevel}`,
        desc: `You have ${this.evaluationsReceived} evaluation${this.evaluationsReceived !== 1 ? 's' : ''}. Higher-ranked verifiers give bigger score boosts.`,
        cta: 'View score',
        action: () => {},
      },
    ] as const;

    const step = steps[stepIdx]!;

    return html`
      <div class="stack">
        <!-- User header -->
        <div class="user-header">
          <div class="user-info">
            <div class="user-avatar">
              ${
                this.userAvatar
                  ? html`<img src=${this.userAvatar} alt=${this.userName} />`
                  : svgUser
              }
            </div>
            <div>
              <p class="user-name">${this.userName}</p>
              ${levelBadge(this.currentLevel, 'sm')}
            </div>
          </div>
          <div class="user-actions">
            <button
              class="icon-btn"
              title="Disconnect"
              @click=${() => this._go('intro')}
            >
              ${svgPower}
            </button>
          </div>
        </div>

        <!-- Requirement indicator -->
        <div class="req-indicator ${isMet ? 'req-met' : 'req-unmet'}">
          ${isMet ? svgCheck : svgBadgeCheck}
          <span
            >${isMet ? `Level ${this.requiredLevel} requirement met` : `Level ${this.requiredLevel} required`}</span
          >
        </div>

        ${
          isMet
            ? this._renderProgressSuccess()
            : html`
                <!-- Step card -->
                <div class="step-card">
                  <div class="step-card-top">
                    <span class="step-pill">
                      ${svgZap} Step ${stepIdx + 1} of 3
                    </span>
                    <div class="stepper">
                      ${[0, 1, 2].map((i) => html`<span class="stepper-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}"></span>`)}
                    </div>
                  </div>
                  <h3 class="step-title">${step.title}</h3>
                  <p class="step-desc">${step.desc}</p>
                  <button class="btn btn-primary" @click=${step.action}>
                    ${svgUsers} ${step.cta}
                  </button>
                </div>

                <!-- Metrics -->
                <div class="metrics-grid">
                  <button
                    class="metric-card"
                    @click=${() => this._go('find-players')}
                  >
                    <div class="metric-label">${svgUsers} Evaluations</div>
                    <div class="metric-val">
                      ${this.evaluationsReceived}<span class="metric-sub">
                        / ${this.evaluationsNeeded}</span
                      >
                    </div>
                    <div class="metric-bar">
                      <div
                        class="metric-bar-fill"
                        style="width:${evalPct}%;background:var(--aura-info,#60a5fa)"
                      ></div>
                    </div>
                  </button>
                  <button class="metric-card" @click=${() => {}}>
                    <div class="metric-label">${svgTrending} Score</div>
                    <div class="metric-val">
                      ${this.score}<span class="metric-sub">
                        / ${this.scoreNeeded}</span
                      >
                    </div>
                    <div class="metric-bar">
                      <div
                        class="metric-bar-fill"
                        style="width:${scorePct}%;background:var(--aura-warning,#f59e0b)"
                      ></div>
                    </div>
                  </button>
                </div>
              `
        }
      </div>
    `;
  }

  private _renderProgressSuccess() {
    return html`
      <div
        style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:0.5rem 0;text-align:center;"
      >
        <div
          style="width:3rem;height:3rem;border-radius:9999px;background:rgba(74,222,128,0.1);display:flex;align-items:center;justify-content:center;"
        >
          <span
            style="width:1.5rem;height:1.5rem;color:var(--aura-success,#4ade80)"
            >${svgCheck}</span
          >
        </div>
        <p
          style="margin:0;font-size:0.875rem;color:var(--foreground,#fff);font-weight:600;"
        >
          Verification Complete
        </p>
        <p
          style="margin:0;font-size:0.8125rem;color:var(--muted-foreground,#8888aa)"
        >
          You meet the requirements for ${this.appName}
        </p>
        <button class="btn btn-primary" @click=${() => this._go('success')}>
          Continue
        </button>
      </div>
    `;
  }

  /* ── Success ────────────────────────────────────── */
  private _renderSuccess() {
    const level = Math.max(1, Math.min(3, this.currentLevel)) as 1 | 2 | 3;
    return html`
      <div class="success-stack">
        <div class="success-ring">
          <div class="ring-pulse"></div>
          <div class="ring-inner">${svgCheck}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <h2 class="success-title">Verification Successful</h2>
          <p class="success-desc">You're verified to use ${this.appName}</p>
        </div>

        <div class="level-card">
          <span class="level-label-text">Your Level</span>
          ${levelBadge(level, 'lg')}
        </div>

        <button
          class="btn btn-primary"
          style="width:100%"
          @click=${() => this._emit('verified')}
        >
          Continue to ${this.appName}
        </button>

        <p class="footnote">
          This verification can be used across multiple apps
        </p>
      </div>
    `;
  }

  /* ── How it works ───────────────────────────────── */
  private _renderHowItWorks() {
    const hiw = [
      {
        icon: svgUser,
        title: 'Connect Your Identity',
        desc: 'Link your BrightID or create a universal identifier that you control.',
      },
      {
        icon: svgUsers,
        title: 'Get Evaluated',
        desc: 'People who know you evaluate your uniqueness. No personal info is shared.',
      },
      {
        icon: svgBadgeCheck,
        title: 'Earn Levels',
        desc: 'Your verification level increases as you receive positive evaluations.',
      },
      {
        icon: svgLockOpen,
        title: 'Unlock Access',
        desc: 'Apps verify your level to grant access — without seeing your identity.',
      },
    ];
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" @click=${() => this._go(this._prevStep)}>
            ${svgChevronLeft}
          </button>
          <h2 class="page-title">How Aura Works</h2>
        </div>

        <div class="hiw-steps">
          ${hiw.map(
            (s) => html`
              <div class="hiw-step">
                <div class="hiw-icon">${s.icon}</div>
                <div>
                  <h3 class="hiw-step-title">${s.title}</h3>
                  <p class="hiw-step-desc">${s.desc}</p>
                </div>
              </div>
            `,
          )}
        </div>

        <div class="privacy-note">
          ${svgLock}
          <div>
            <p class="privacy-heading">Privacy First</p>
            <p class="privacy-desc">
              Aura generates privacy-preserving proofs. Apps only see your
              verification level, never your identity.
            </p>
          </div>
        </div>

        <button
          class="btn btn-secondary"
          @click=${() => this._go(this._prevStep)}
        >
          Got it
        </button>
      </div>
    `;
  }

  /* ── Find players ───────────────────────────────── */
  private _renderFindPlayers() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" @click=${() => this._go('progress')}>
            ${svgChevronLeft}
          </button>
          <h2 class="page-title">Find Players</h2>
        </div>

        <div class="find-options">
          <button class="find-option">
            <div class="find-option-icon">${svgShare}</div>
            <div>
              <p class="find-option-name">Share profile link</p>
              <p class="find-option-desc">
                Send your link to Aura players you know
              </p>
            </div>
          </button>
          <button class="find-option">
            <div class="find-option-icon">${svgMail}</div>
            <div>
              <p class="find-option-name">Import contacts</p>
              <p class="find-option-desc">
                Find existing Aura players in your contacts
              </p>
            </div>
          </button>
        </div>

        <div class="empty-hint">
          ${svgUsers}
          <span>No players asked yet — share your link to get started</span>
        </div>
      </div>
    `;
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true, detail }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aura-preview-frame': AuraPreviewFrame;
  }
}
