import { askedEvaluationPlayers } from '@/lib/data/contacts'
import {
  userBrightId,
  userFirstName,
  userLastName,
  userProfilePicture
} from '@/states/user'
import type { AuraImpact } from '@/types/evaluation'
import type { Project } from '@/types/projects'
import { computeRequirements } from '@/utils/score'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement, type PropertyValues } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import type { Step } from './index'
import './index'
import type { ProgressStepData } from './progress-step'

type StepOption = 'auto' | Step

const DEFAULT_BRIGHTID = 'demo-brightid-0x1234567890abcdef'

@customElement('verification-test-harness')
export class VerificationTestHarnessElement extends SignalWatcher(LitElement) {
  @state() private brightId = DEFAULT_BRIGHTID
  @state() private firstName = 'Alice'
  @state() private lastName = 'Example'
  @state() private profilePicture = ''

  @state() private appName = 'Demo App'
  @state() private appDescription = 'A sample app using Aura verification'
  @state() private appLogo = ''
  @state() private requiredLevel: 1 | 2 | 3 | 4 = 2

  @state() private auraLevel: 0 | 1 | 2 | 3 | 4 = 1
  @state() private auraScore = 12_500_000

  // Synthetic evaluations: counts by evaluator level × confidence
  @state() private lowFromL1 = 1
  @state() private mediumFromL1 = 0
  @state() private highFromL2 = 0
  @state() private mediumFromL2 = 0
  @state() private highFromL3 = 0
  @state() private mediumFromL3 = 0

  @state() private askedCount = 2
  @state() private initialStep: StepOption = 'auto'
  @state() private sticky = true

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family:
        system-ui,
        -apple-system,
        sans-serif;
      color: var(--foreground);
      background: var(--background);
      min-height: 100%;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
      gap: 1.25rem;
      padding: 1rem;
      align-items: start;
    }
    @media (max-width: 820px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }

    /* Controls panel */
    .panel {
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      background: var(--card);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: calc(100vh - 2rem);
      overflow-y: auto;
    }
    .panel.sticky {
      position: sticky;
      top: 1rem;
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .panel-title {
      font-size: 0.875rem;
      font-weight: 600;
      flex: 1;
    }
    .panel-badge {
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.15rem 0.4rem;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--aura-warning) 15%, transparent);
      color: var(--aura-warning);
      border: 1px solid color-mix(in srgb, var(--aura-warning) 40%, transparent);
    }

    fieldset {
      border: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    legend {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
      padding: 0;
      margin-bottom: 0.25rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: var(--muted-foreground);
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    input[type='text'],
    input[type='number'],
    input[type='url'],
    select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.4rem 0.55rem;
      background: var(--secondary);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      font: inherit;
      font-size: 0.8rem;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus,
    select:focus {
      border-color: var(--primary);
    }
    .range-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    input[type='range'] {
      flex: 1;
      accent-color: var(--primary);
    }
    .range-value {
      min-width: 2.5rem;
      text-align: right;
      font-size: 0.75rem;
      color: var(--foreground);
      font-variant-numeric: tabular-nums;
    }

    .presets {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
    }
    .preset-btn,
    .action-btn {
      font: inherit;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.45rem 0.5rem;
      border-radius: 0.4rem;
      border: 1px solid var(--border);
      background: var(--secondary);
      color: var(--foreground);
      cursor: pointer;
      transition: background 0.15s;
    }
    .preset-btn:hover,
    .action-btn:hover {
      background: color-mix(in srgb, var(--secondary) 70%, var(--foreground) 6%);
    }
    .action-btn.primary {
      background: var(--primary);
      color: var(--primary-foreground, white);
      border-color: transparent;
    }
    .action-btn.primary:hover {
      background: color-mix(in srgb, var(--primary) 85%, black 15%);
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--foreground);
      cursor: pointer;
    }
    .toggle input {
      accent-color: var(--primary);
    }

    /* Preview panel */
    .preview {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .preview-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.7rem;
      color: var(--muted-foreground);
    }
    .preview-meta strong {
      color: var(--foreground);
      font-weight: 600;
    }
    .preview-frame {
      max-width: 480px;
    }
  `

  protected updated(_changed: PropertyValues) {
    this._syncSignals()
  }

  private _syncSignals() {
    userBrightId.set(this.brightId)
    userFirstName.set(this.firstName)
    userLastName.set(this.lastName)
    userProfilePicture.set(this.profilePicture)
    const now = Date.now()
    askedEvaluationPlayers.set(
      Array.from({ length: this.askedCount }, (_, i) => ({
        name: `Pending Player ${i + 1}`,
        value: `pending-${i}@example.com`,
        askedAt: now - i * 60_000
      }))
    )
  }

  protected render() {
    const project = this._buildProject()
    const mockData = this._buildMockData()
    const initial = this.initialStep === 'auto' ? null : this.initialStep

    return html`
      <div class="layout">
        <div class="panel ${this.sticky ? 'sticky' : ''}">
          <div class="panel-header">
            <span class="panel-title">Verification test harness</span>
            <span class="panel-badge">Dev only</span>
          </div>

          <fieldset>
            <legend>Presets</legend>
            <div class="presets">
              <button class="preset-btn" @click=${() => this._applyPreset('new')}>
                New user
              </button>
              <button class="preset-btn" @click=${() => this._applyPreset('level1')}>
                Level 1
              </button>
              <button class="preset-btn" @click=${() => this._applyPreset('level2')}>
                Level 2
              </button>
              <button class="preset-btn" @click=${() => this._applyPreset('verified')}>
                Verified
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>User</legend>
            <label>
              BrightID
              <div class="range-row">
                <input
                  type="text"
                  .value=${this.brightId}
                  @input=${(e: Event) =>
                    (this.brightId = (e.target as HTMLInputElement).value)}
                />
                <button class="preset-btn" @click=${() => this._randomizeBrightId()}>
                  Random
                </button>
              </div>
            </label>
            <div class="row">
              <label>
                First name
                <input
                  type="text"
                  .value=${this.firstName}
                  @input=${(e: Event) =>
                    (this.firstName = (e.target as HTMLInputElement).value)}
                />
              </label>
              <label>
                Last name
                <input
                  type="text"
                  .value=${this.lastName}
                  @input=${(e: Event) =>
                    (this.lastName = (e.target as HTMLInputElement).value)}
                />
              </label>
            </div>
            <label>
              Profile picture URL
              <input
                type="url"
                placeholder="https://…"
                .value=${this.profilePicture}
                @input=${(e: Event) =>
                  (this.profilePicture = (e.target as HTMLInputElement).value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>App / Project</legend>
            <label>
              Name
              <input
                type="text"
                .value=${this.appName}
                @input=${(e: Event) => (this.appName = (e.target as HTMLInputElement).value)}
              />
            </label>
            <label>
              Description
              <input
                type="text"
                .value=${this.appDescription}
                @input=${(e: Event) =>
                  (this.appDescription = (e.target as HTMLInputElement).value)}
              />
            </label>
            <label>
              Logo URL
              <input
                type="url"
                placeholder="https://…"
                .value=${this.appLogo}
                @input=${(e: Event) => (this.appLogo = (e.target as HTMLInputElement).value)}
              />
            </label>
            <label>
              Required level
              <select
                @change=${(e: Event) =>
                  (this.requiredLevel = Number((e.target as HTMLSelectElement).value) as 1 |
                    2 |
                    3 |
                    4)}
              >
                ${[1, 2, 3, 4].map(
                  (l) =>
                    html`<option value=${l} ?selected=${this.requiredLevel === l}>
                      Level ${l}
                    </option>`
                )}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>Verification state</legend>
            <label>
              Aura level
              <div class="range-row">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  .value=${String(this.auraLevel)}
                  @input=${(e: Event) =>
                    (this.auraLevel = Number((e.target as HTMLInputElement).value) as
                      | 0
                      | 1
                      | 2
                      | 3
                      | 4)}
                />
                <span class="range-value">L${this.auraLevel}</span>
              </div>
            </label>
            <label>
              Aura score
              <div class="range-row">
                <input
                  type="range"
                  min="0"
                  max="200000000"
                  step="500000"
                  .value=${String(this.auraScore)}
                  @input=${(e: Event) =>
                    (this.auraScore = Number((e.target as HTMLInputElement).value))}
                />
                <span class="range-value">${this._formatScore(this.auraScore)}</span>
              </div>
            </label>
          </fieldset>

          <fieldset>
            <legend>Evaluations received</legend>
            ${this._renderEvalCounter('Low+ from L1+ player', 'lowFromL1')}
            ${this._renderEvalCounter('Medium+ from L1+ player', 'mediumFromL1')}
            ${this._renderEvalCounter('High+ from L2+ player', 'highFromL2')}
            ${this._renderEvalCounter('Medium+ from L2+ player', 'mediumFromL2')}
            ${this._renderEvalCounter('High+ from L3+ player', 'highFromL3')}
            ${this._renderEvalCounter('Medium+ from L3+ player', 'mediumFromL3')}
          </fieldset>

          <fieldset>
            <legend>Other</legend>
            <label>
              Asked players (pending)
              <div class="range-row">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  .value=${String(this.askedCount)}
                  @input=${(e: Event) =>
                    (this.askedCount = Number((e.target as HTMLInputElement).value))}
                />
                <span class="range-value">${this.askedCount}</span>
              </div>
            </label>
            <label>
              Initial step
              <select
                @change=${(e: Event) =>
                  (this.initialStep = (e.target as HTMLSelectElement).value as StepOption)}
              >
                ${(
                  [
                    'auto',
                    'connect',
                    'progress',
                    'success',
                    'how-it-works',
                    'find-players',
                    'edit-profile',
                    'evaluations',
                    'score'
                  ] as StepOption[]
                ).map(
                  (s) =>
                    html`<option value=${s} ?selected=${this.initialStep === s}>${s}</option>`
                )}
              </select>
            </label>
            <label class="toggle">
              <input
                type="checkbox"
                ?checked=${this.sticky}
                @change=${(e: Event) =>
                  (this.sticky = (e.target as HTMLInputElement).checked)}
              />
              Sticky controls
            </label>
          </fieldset>

        </div>

        <div class="preview">
          <div class="preview-meta">
            Preview: <strong>${this.appName || 'App'}</strong> · required
            <strong>Level ${this.requiredLevel}</strong> · user
            <strong>Level ${this.auraLevel}</strong>
          </div>
          <div class="preview-frame">
            <app-verification-embed
              mock
              .mockProject=${project}
              .mockData=${mockData}
              .initialStep=${initial}
              .height=${550}
            ></app-verification-embed>
          </div>
        </div>
      </div>
    `
  }

  private _renderEvalCounter(
    label: string,
    key:
      | 'lowFromL1'
      | 'mediumFromL1'
      | 'highFromL2'
      | 'mediumFromL2'
      | 'highFromL3'
      | 'mediumFromL3'
  ) {
    return html`
      <label>
        ${label}
        <div class="range-row">
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            .value=${String(this[key])}
            @input=${(e: Event) =>
              ((this[key] as number) = Number((e.target as HTMLInputElement).value))}
          />
          <span class="range-value">${this[key]}</span>
        </div>
      </label>
    `
  }

  private _buildProject(): Project {
    const now = new Date().toISOString()
    return {
      id: 0,
      name: this.appName,
      description: this.appDescription,
      image: this.appLogo || undefined,
      requirementLevel: this.requiredLevel,
      createdAt: now,
      updatedAt: now,
      deadline: now
    }
  }

  private _buildImpacts(): AuraImpact[] {
    const impacts: AuraImpact[] = []
    const add = (count: number, level: number, confidence: number, prefix: string) => {
      for (let i = 0; i < count; i++) {
        impacts.push({
          evaluator: `${prefix}-${i}`,
          evaluatorName: `${prefix} ${i + 1}`,
          level,
          confidence,
          score: 10_000_000,
          impact: 1_000_000
        })
      }
    }
    // Strongest shape first so it always satisfies higher-level reqs.
    add(this.highFromL3, 3, 3, 'H3')
    add(this.mediumFromL3, 3, 2, 'M3')
    add(this.highFromL2, 2, 3, 'H2')
    add(this.mediumFromL2, 2, 2, 'M2')
    add(this.mediumFromL1, 1, 2, 'M1')
    add(this.lowFromL1, 1, 1, 'L1')
    return impacts
  }

  private _buildMockData(): ProgressStepData {
    const auraImpacts = this._buildImpacts()
    return {
      brightId: this.brightId,
      auraLevel: this.auraLevel,
      auraScore: this.auraScore,
      evaluationsReceived: auraImpacts.length,
      auraImpacts,
      requirements: computeRequirements(this.auraScore, auraImpacts)
    }
  }

  private _formatScore(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toString()
  }

  private _randomizeBrightId() {
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    this.brightId = `demo-${rand}`
  }

  private _applyPreset(preset: 'new' | 'level1' | 'level2' | 'verified') {
    switch (preset) {
      case 'new':
        this.auraLevel = 0
        this.auraScore = 0
        this.lowFromL1 = 0
        this.mediumFromL1 = 0
        this.highFromL2 = 0
        this.mediumFromL2 = 0
        this.highFromL3 = 0
        this.mediumFromL3 = 0
        this.askedCount = 0
        break
      case 'level1':
        this.auraLevel = 1
        this.auraScore = 15_000_000
        this.lowFromL1 = 1
        this.mediumFromL1 = 0
        this.highFromL2 = 0
        this.mediumFromL2 = 0
        this.highFromL3 = 0
        this.mediumFromL3 = 0
        this.askedCount = 2
        break
      case 'level2':
        this.auraLevel = 2
        this.auraScore = 60_000_000
        this.lowFromL1 = 1
        this.mediumFromL1 = 1
        this.highFromL2 = 0
        this.mediumFromL2 = 0
        this.highFromL3 = 0
        this.mediumFromL3 = 0
        this.askedCount = 1
        break
      case 'verified':
        this.auraLevel = 4
        this.auraScore = 180_000_000
        this.lowFromL1 = 1
        this.mediumFromL1 = 1
        this.highFromL2 = 1
        this.mediumFromL2 = 1
        this.highFromL3 = 1
        this.mediumFromL3 = 1
        this.askedCount = 0
        break
    }
    this.requiredLevel = preset === 'verified' ? 4 : 2
  }

}
