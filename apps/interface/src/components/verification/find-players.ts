import googleIcon from '@/assets/icons/google.svg'
import {
  askedEvaluationPlayers,
  foundAuraPlayersFromContact,
  hasTriedFindingPlayers,
  sentPlayerLinks
} from '@/lib/data/contacts'
import { userBrightId, userFirstName, userGravatarEmail, userLastName } from '@/states/user'
import type { AuraImpact } from '@/types/evaluation'

async function getGravatarHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

import { Mutation } from '@aura/query'
import { SignalWatcher } from '@lit-labs/signals'
import { type CSSResultGroup, css, html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { clientAPI } from '@/utils/apis'
import type { Contact } from '@/utils/integrations/contacts'
import { parseContactsFile } from '@/utils/integrations/contacts-file'
import { getContactsList } from '@/utils/integrations/google'
import './level-badge'
import type { ContactsHashWorkerOutput } from '@/workers/contacts-hash.worker'

@customElement('verification-find-players')
export class VerificationFindPlayersElement extends SignalWatcher(LitElement) {
  @property({ type: Array }) auraImpacts: AuraImpact[] = []

  @state() private searchQuery = ''
  @state() private _copied = false
  @state() private _shareTarget: {
    name: string
    value: string
    photo?: string
  } | null = null
  @state() private _shareTargetCopied = false
  @state() private _myProfileUrl = ''

  override connectedCallback() {
    super.connectedCallback()
    this._buildProfileUrl().then((url) => {
      this._myProfileUrl = url
    })
  }

  #googleImport = new Mutation<void, void>(this, {
    mutationFn: async () => {
      const contacts = await getContactsList()
      if (!contacts?.length) return
      await this._processContacts(contacts)
    }
  })

  #fileImport = new Mutation<void, File>(this, {
    mutationFn: async (file: File) => {
      const contacts = await parseContactsFile(file)
      if (!contacts.length) return
      await this._processContacts(contacts)
    }
  })

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }

    /* ── Layout ─────────────────────────────── */
    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.875em;
    }

    /* ── Header ─────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      gap: 0.625em;
    }
    .back-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.25em;
      height: 2.25em;
      border-radius: 0.5em;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      transition:
        background 0.15s,
        color 0.15s;
    }
    .back-btn:hover {
      background: var(--secondary);
      color: var(--foreground);
    }
    .back-btn iconify-icon {
      width: 1.375em;
      height: 1.375em;
    }
    .header-text {
      flex: 1;
      min-width: 0;
    }
    .header-title {
      margin: 0;
      font-size: 0.9375em;
      font-weight: 600;
      color: var(--foreground);
      line-height: 1.2;
    }
    .header-sub {
      font-size: 0.7em;
      color: var(--muted-foreground);
      margin-top: 0.15em;
    }

    /* ── Profile share bar ───────────────────── */
    .profile-bar {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.625em 0.75em;
      background: color-mix(in srgb, var(--primary) 5%, var(--secondary));
      border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
      border-radius: var(--radius, 0.75rem);
    }
    .profile-bar-icon {
      flex-shrink: 0;
      width: 1.875em;
      height: 1.875em;
      border-radius: 0.5em;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }
    .profile-bar-icon iconify-icon {
      width: 1em;
      height: 1em;
    }
    .profile-bar-info {
      flex: 1;
      min-width: 0;
    }
    .profile-bar-label {
      font-size: 0.775em;
      font-weight: 600;
      color: var(--foreground);
    }
    .profile-bar-desc {
      font-size: 0.68em;
      color: var(--muted-foreground);
      margin-top: 0.1em;
    }
    .profile-bar-actions {
      display: flex;
      gap: 0.375em;
      flex-shrink: 0;
    }
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2em;
      height: 2em;
      border-radius: 0.5em;
      cursor: pointer;
      transition:
        background 0.15s,
        transform 0.1s;
      flex-shrink: 0;
    }
    .icon-btn:active {
      transform: scale(0.93);
    }
    .icon-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .icon-btn iconify-icon {
      width: 0.9375em;
      height: 0.9375em;
    }
    .icon-btn.solid {
      background: var(--primary);
      color: var(--primary-foreground, #fff);
      border: none;
    }
    .icon-btn.solid:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary) 85%, black 15%);
    }
    .icon-btn.solid.success {
      background: var(--aura-success, #22c55e);
    }
    .icon-btn.ghost {
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
      color: var(--primary);
    }
    .icon-btn.ghost:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary) 16%, transparent);
    }

    /* ── Contacts section ────────────────────── */
    .section-label {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 0.7em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .import-row {
      display: flex;
      gap: 0.5em;
    }
    .import-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4em;
      padding: 0.5em 0.625em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 0.625em;
      cursor: pointer;
      font: inherit;
      font-size: 0.775em;
      font-weight: 500;
      color: var(--foreground);
      transition:
        background 0.15s,
        border-color 0.15s;
    }
    .import-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--secondary) 70%, var(--foreground) 6%);
      border-color: color-mix(in srgb, var(--border) 60%, var(--foreground) 20%);
    }
    .import-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .import-btn img,
    .import-btn iconify-icon {
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }
    .file-input {
      display: none;
    }

    /* ── Search ──────────────────────────────── */
    .search-wrap {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 0.75em;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .search-icon iconify-icon {
      width: 0.875em;
      height: 0.875em;
    }
    .search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.575em 0.875em 0.575em 2.125em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: 0.625em;
      font-size: 0.85em;
      color: var(--foreground);
      outline: none;
      transition: border-color 0.15s;
      font: inherit;
      font-size: 0.85em;
    }
    .search-input::placeholder {
      color: var(--muted-foreground);
    }
    .search-input:focus {
      border-color: var(--primary);
    }

    /* ── Loading / error ─────────────────────── */
    .import-loading {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.5em 0.75em;
      background: color-mix(in srgb, var(--primary) 5%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
      border-radius: 0.625em;
      font-size: 0.775em;
      color: var(--muted-foreground);
    }
    .spinner {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 9999px;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .error-msg {
      padding: 0.5em 0.75em;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 0.625em;
      font-size: 0.75em;
      color: var(--destructive);
    }

    /* ── Discord banner ─────────────────────── */
    .discord-banner {
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.75em 0.875em;
      background: color-mix(in srgb, #5865f2 6%, var(--secondary));
      border: 1px solid color-mix(in srgb, #5865f2 22%, transparent);
      border-radius: var(--radius, 0.75rem);
    }
    .discord-icon {
      flex-shrink: 0;
      width: 2em;
      height: 2em;
      border-radius: 0.5em;
      background: color-mix(in srgb, #5865f2 14%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #5865f2;
    }
    .discord-icon iconify-icon {
      width: 1em;
      height: 1em;
    }
    .discord-text {
      flex: 1;
      min-width: 0;
    }
    .discord-title {
      font-size: 0.775em;
      font-weight: 600;
      color: var(--foreground);
    }
    .discord-desc {
      font-size: 0.68em;
      color: var(--muted-foreground);
      margin-top: 0.15em;
    }
    .discord-link {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.3em;
      font-size: 0.72em;
      font-weight: 600;
      color: #5865f2;
      text-decoration: none;
      padding: 0.35em 0.65em;
      border-radius: 0.5em;
      border: 1px solid color-mix(in srgb, #5865f2 35%, transparent);
      background: color-mix(in srgb, #5865f2 8%, transparent);
      transition: background 0.15s;
      white-space: nowrap;
    }
    .discord-link:hover {
      background: color-mix(in srgb, #5865f2 16%, transparent);
    }
    .discord-link iconify-icon {
      width: 0.8em;
      height: 0.8em;
    }

    /* ── Players list ────────────────────────── */
    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .list-count {
      font-size: 0.72em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .players-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      max-height: 14em;
      overflow-y: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      overflow: hidden;
    }

    /* ── Player card ─────────────────────────── */
    .player-card {
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.625em 0.75em;
      background: var(--card);
      border: none;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      text-align: left;
      font: inherit;
      transition: background 0.15s;
      width: 100%;
      min-width: 0;
    }
    .player-card:last-child {
      border-bottom: none;
    }
    .player-card:hover {
      background: color-mix(in srgb, var(--card) 60%, var(--secondary) 40%);
    }
    .player-card.selected {
      background: color-mix(in srgb, var(--primary) 5%, var(--card));
    }
    .player-card.done {
      opacity: 0.5;
    }

    .player-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .player-avatar {
      width: 2.25em;
      height: 2.25em;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--primary) 14%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72em;
      font-weight: 700;
      color: var(--primary);
      overflow: hidden;
    }
    .player-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sent-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 0.625em;
      height: 0.625em;
      border-radius: 9999px;
      background: var(--aura-success, #22c55e);
      border: 1.5px solid var(--card);
    }

    .player-info {
      flex: 1;
      min-width: 0;
    }
    .player-name {
      font-size: 0.85em;
      font-weight: 500;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .player-credential {
      display: flex;
      align-items: center;
      gap: 0.275em;
      font-size: 0.68em;
      color: var(--muted-foreground);
      margin-top: 0.125em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .player-credential iconify-icon {
      flex-shrink: 0;
    }

    .eval-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      font-size: 0.65em;
      font-weight: 600;
      color: var(--aura-success, #22c55e);
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.22);
      border-radius: 9999px;
      padding: 0.2em 0.55em;
      flex-shrink: 0;
    }
    .eval-badge iconify-icon {
      width: 0.7em;
      height: 0.7em;
    }

    .asked-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      font-size: 0.65em;
      font-weight: 600;
      color: var(--aura-info, #06b6d4);
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.22);
      border-radius: 9999px;
      padding: 0.2em 0.55em;
      flex-shrink: 0;
    }
    .asked-badge iconify-icon {
      width: 0.7em;
      height: 0.7em;
    }

    .sent-dot.asked {
      background: var(--aura-info, #06b6d4);
    }

    .card-chevron {
      flex-shrink: 0;
      color: var(--muted-foreground);
      opacity: 0.5;
      transition:
        opacity 0.15s,
        transform 0.2s;
    }
    .player-card.selected .card-chevron {
      opacity: 1;
      color: var(--primary);
      transform: rotate(90deg);
    }
    .card-chevron iconify-icon {
      width: 0.875em;
      height: 0.875em;
    }

    /* ── Share strip (inline, below selected card) ── */
    .share-strip {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.5em 0.75em;
      background: color-mix(in srgb, var(--primary) 5%, var(--secondary));
      border-bottom: 1px solid var(--border);
    }
    .share-strip:last-child {
      border-bottom: none;
    }
    .share-strip-text {
      flex: 1;
      min-width: 0;
      font-size: 0.72em;
      color: var(--muted-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .share-strip-text strong {
      color: var(--foreground);
      font-weight: 600;
    }

    /* ── Divider between groups ──────────────── */
    .group-divider {
      display: flex;
      align-items: center;
      gap: 0.5em;
      padding: 0.375em 0.75em;
      font-size: 0.65em;
      font-weight: 600;
      color: var(--muted-foreground);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: color-mix(in srgb, var(--secondary) 60%, transparent);
      border-bottom: 1px solid var(--border);
    }

    /* ── Empty state ─────────────────────────── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375em;
      padding: 1.5em 1em;
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      text-align: center;
    }
    .empty-icon {
      width: 2.5em;
      height: 2.5em;
      border-radius: 9999px;
      background: var(--secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted-foreground);
      margin-bottom: 0.25em;
    }
    .empty-icon iconify-icon {
      width: 1.25em;
      height: 1.25em;
    }
    .empty-title {
      font-size: 0.825em;
      font-weight: 500;
      color: var(--foreground);
    }
    .empty-desc {
      font-size: 0.72em;
      color: var(--muted-foreground);
    }
  `

  protected render() {
    const players = foundAuraPlayersFromContact.get()
    const brightId = userBrightId.get()

    const filtered = players.filter((p) =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    )

    const isImporting = this.#googleImport.isPending || this.#fileImport.isPending
    const importError = this.#googleImport.error?.message ?? this.#fileImport.error?.message ?? ''

    return html`
      <div class="stack">
        <!-- Header -->
        <div class="header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <div class="header-text">
            <h2 class="header-title">Find Aura Players</h2>
            <p class="header-sub">Import contacts or share your profile to get evaluated</p>
          </div>
        </div>

        <!-- Profile share bar -->
        <div class="profile-bar">
          <div class="profile-bar-icon">
            <iconify-icon icon="lucide:link"></iconify-icon>
          </div>
          <div class="profile-bar-info">
            <div class="profile-bar-label">Your profile link</div>
            <div class="profile-bar-desc">Send it to Aura players and ask for an evaluation</div>
          </div>
          <div class="profile-bar-actions">
            <button
              class="icon-btn solid ${this._copied ? 'success' : ''}"
              ?disabled=${!brightId}
              aria-label=${this._copied ? 'Copied' : 'Copy link'}
              @click=${() => this._copyProfileLink(brightId)}
            >
              <iconify-icon icon=${this._copied ? 'lucide:check' : 'lucide:copy'}></iconify-icon>
            </button>
            <button
              class="icon-btn ghost"
              ?disabled=${!brightId}
              aria-label="Share profile"
              @click=${() => this._shareProfileLink(brightId)}
            >
              <iconify-icon icon="lucide:share-2"></iconify-icon>
            </button>
          </div>
        </div>

        <!-- Import contacts -->
        <div>
          <p class="section-label">From contacts</p>
          <div class="import-row" style="margin-top: 0.5em">
            <button
              class="import-btn"
              ?disabled=${isImporting}
              @click=${() => this.#googleImport.mutate()}
            >
              <img src=${googleIcon} alt="Google" />
              Google Contacts
            </button>
            <button
              class="import-btn"
              ?disabled=${isImporting}
              @click=${() =>
                this.shadowRoot?.querySelector<HTMLInputElement>('.file-input')?.click()}
            >
              <iconify-icon icon="lucide:upload"></iconify-icon>
              Import file
            </button>
            <input
              class="file-input"
              type="file"
              accept=".vcf,.csv"
              @change=${(e: Event) => this._onFileSelected(e)}
            />
          </div>
        </div>

        ${isImporting
          ? html`
              <div class="import-loading">
                <div class="spinner"></div>
                <span>Importing contacts… this may take a moment</span>
              </div>
            `
          : ''}
        ${importError ? html`<p class="error-msg">${importError}</p>` : ''}
        ${!isImporting && players.length === 0 && hasTriedFindingPlayers.get()
          ? html`
              <div class="discord-banner">
                <div class="discord-icon">
                  <iconify-icon icon="simple-icons:discord"></iconify-icon>
                </div>
                <div class="discord-text">
                  <div class="discord-title">No Aura players in your contacts?</div>
                  <div class="discord-desc">
                    Find other players and get evaluated on our community server
                  </div>
                </div>
                <a
                  class="discord-link"
                  href="https://discord.gg/pcWy6NqM"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join
                  <iconify-icon icon="lucide:external-link"></iconify-icon>
                </a>
              </div>
            `
          : ''}

        <!-- Search + list -->
        ${players.length > 0
          ? html`
              <div class="search-wrap">
                <span class="search-icon">
                  <iconify-icon icon="lucide:search"></iconify-icon>
                </span>
                <input
                  class="search-input"
                  type="text"
                  placeholder="Search players…"
                  .value=${this.searchQuery}
                  @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
                />
              </div>
              ${this._renderPlayers(filtered)}
            `
          : ''}
      </div>
    `
  }

  private _renderPlayers(filtered: { name: string; value: string; photo?: string }[]) {
    const sent = sentPlayerLinks.get()
    const askedSet = new Set(askedEvaluationPlayers.get().map((p) => p.value))
    const evaluatedIds = new Set(this.auraImpacts.map((i) => i.evaluator))

    if (filtered.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">
            <iconify-icon icon="lucide:users"></iconify-icon>
          </div>
          <p class="empty-title">No players found</p>
          <p class="empty-desc">Try a different name or import more contacts</p>
        </div>
      `
    }

    const active = filtered.filter((p) => !evaluatedIds.has(p.value))
    const done = filtered.filter((p) => evaluatedIds.has(p.value))

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const renderCard = (player: { name: string; value: string; photo?: string }) => {
      const isEvaluated = evaluatedIds.has(player.value)
      const isSent = sent.includes(player.value)
      const isAsked = askedSet.has(player.value)
      const isSelected = this._shareTarget?.value === player.value
      const isEmail = player.value.includes('@')

      return html`
        <button
          class="player-card ${isEvaluated ? 'done' : ''} ${isSelected ? 'selected' : ''}"
          @click=${() => {
            this._shareTarget = isSelected ? null : player
            this._shareTargetCopied = false
          }}
        >
          <div class="player-avatar-wrap">
            <div class="player-avatar">
              ${player.photo
                ? html`<img src=${player.photo} alt=${player.name} />`
                : getInitials(player.name)}
            </div>
            ${isAsked && !isEvaluated ? html`<span class="sent-dot asked"></span>` : ''}
          </div>
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-credential">
              <iconify-icon
                icon=${isEmail ? 'lucide:mail' : 'lucide:phone'}
                width="0.75em"
                height="0.75em"
              ></iconify-icon>
              ${player.value}
            </div>
          </div>
          ${isEvaluated
            ? html`<span class="eval-badge">
                <iconify-icon icon="lucide:check"></iconify-icon>
                Evaluated
              </span>`
            : isAsked
              ? html`<span class="asked-badge">
                  <iconify-icon icon="lucide:clock"></iconify-icon>
                  Asked
                </span>`
              : html`<span class="card-chevron">
                  <iconify-icon icon="lucide:chevron-right"></iconify-icon>
                </span>`}
        </button>
        ${isSelected
          ? html`
              <div class="share-strip">
                <span class="share-strip-text">
                  Ask <strong>${player.name}</strong> to evaluate you
                </span>
                <button
                  class="icon-btn solid ${this._shareTargetCopied ? 'success' : ''}"
                  aria-label=${this._shareTargetCopied ? 'Copied' : 'Copy link'}
                  @click=${(e: Event) => {
                    e.stopPropagation()
                    this._copyForPlayer()
                  }}
                >
                  <iconify-icon
                    icon=${this._shareTargetCopied ? 'lucide:check' : 'lucide:copy'}
                  ></iconify-icon>
                </button>
                <button
                  class="icon-btn ghost"
                  aria-label="Share"
                  @click=${(e: Event) => {
                    e.stopPropagation()
                    this._shareForPlayer()
                  }}
                >
                  <iconify-icon icon="lucide:share-2"></iconify-icon>
                </button>
              </div>
            `
          : ''}
      `
    }

    return html`
      <div>
        <div class="list-header" style="margin-bottom: 0.375em">
          <span class="list-count"
            >${filtered.length} player${filtered.length !== 1 ? 's' : ''} found</span
          >
        </div>
        <div class="players-list">
          ${active.map(renderCard)}
          ${done.length > 0
            ? html`
                <div class="group-divider">Already evaluated you</div>
                ${done.map(renderCard)}
              `
            : ''}
        </div>
      </div>
    `
  }

  private async _buildProfileUrl(): Promise<string> {
    const brightId = userBrightId.get()
    if (!brightId) return ''
    let queryParams = ''
    const email = userGravatarEmail.get().trim()
    if (email) {
      const hash = await getGravatarHash(email)
      queryParams = '?gravatar=' + encodeURIComponent(hash)
    }
    const name = [userFirstName.get().trim(), userLastName.get().trim()].filter(Boolean).join(' ')
    if (name) {
      queryParams += queryParams
        ? '&name=' + encodeURIComponent(name)
        : '?name=' + encodeURIComponent(name)
    }
    return `https://aura-dev.vercel.app/subject/${encodeURIComponent(brightId)}/` + queryParams
  }

  private _upsertAsked(player: { name: string; value: string; photo?: string }) {
    const asked = askedEvaluationPlayers.get()
    const idx = asked.findIndex((p) => p.value === player.value)
    if (idx >= 0) {
      const updated = [...asked]
      updated[idx] = {
        name: updated[idx]?.name ?? '',
        value: updated[idx]?.value ?? '',
        photo: updated[idx]?.photo,
        askedAt: Date.now()
      }
      askedEvaluationPlayers.set(updated)
    } else {
      askedEvaluationPlayers.set([...asked, { ...player, askedAt: Date.now() }])
    }
  }

  private async _copyForPlayer() {
    if (!this._shareTarget) return
    const url = this._myProfileUrl
    if (!url) return
    await navigator.clipboard.writeText(url)
    const current = sentPlayerLinks.get()
    if (!current.includes(this._shareTarget.value)) {
      sentPlayerLinks.set([...current, this._shareTarget.value])
    }
    this._upsertAsked(this._shareTarget)
    this._shareTargetCopied = true
    setTimeout(() => (this._shareTargetCopied = false), 2000)
  }

  private _shareForPlayer() {
    if (!this._shareTarget) return
    const url = this._myProfileUrl
    if (!url) return
    const target = this._shareTarget
    if (navigator.share) {
      navigator
        .share({
          title: 'Evaluate me on Aura',
          text: `Hey ${target.name}, could you evaluate me on Aura? Here's my profile:`,
          url
        })
        .then(() => {
          const current = sentPlayerLinks.get()
          if (!current.includes(target.value)) sentPlayerLinks.set([...current, target.value])
          this._upsertAsked(target)
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      this._shareTargetCopied = true
      setTimeout(() => (this._shareTargetCopied = false), 2000)
      const current = sentPlayerLinks.get()
      if (!current.includes(target.value)) sentPlayerLinks.set([...current, target.value])
      this._upsertAsked(target)
    }
  }

  private async _copyProfileLink(_brightId: string | null) {
    const url = this._myProfileUrl
    if (!url) return
    await navigator.clipboard.writeText(url)
    this._copied = true
    setTimeout(() => (this._copied = false), 2000)
  }

  private _shareProfileLink(_brightId: string | null) {
    const url = this._myProfileUrl
    if (!url) return
    if (navigator.share) {
      navigator
        .share({
          title: 'Aura Profile',
          text: 'Check out my Aura profile!',
          url
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      this._copied = true
      setTimeout(() => (this._copied = false), 2000)
    }
  }

  private _onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    input.value = ''
    this.#fileImport.mutate(file)
  }

  private async _processContacts(contacts: Contact[]) {
    const worker = new Worker(new URL('../../workers/contacts-hash.worker.ts', import.meta.url), {
      type: 'module'
    })

    const { hashes, hashMap } = await new Promise<ContactsHashWorkerOutput>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<ContactsHashWorkerOutput>) => resolve(e.data)
      worker.onerror = (err) => reject(new Error(err.message))
      worker.postMessage({ contacts })
    })

    worker.terminate()

    if (!hashes.length) return

    const result = await clientAPI.POST(
      '/check-aura-player' as never,
      { body: { hashes } } as never
    )

    if (!result.data) return

    const matchedHashes = (result as { data: { hash: string }[] }).data.map((item) => item.hash)
    const players = matchedHashes
      .map((hash) => hashMap[hash])
      .filter((p): p is { name: string; value: string; photo?: string } => !!p && !!p.name)

    foundAuraPlayersFromContact.set(players)
    hasTriedFindingPlayers.set(true)
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))
  }
}
