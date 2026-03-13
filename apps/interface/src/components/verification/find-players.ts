import { foundAuraPlayersFromContact } from '@/lib/data/contacts'
import { userBrightId } from '@/states/user'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './level-badge'

@customElement('verification-find-players')
export class VerificationFindPlayersElement extends SignalWatcher(LitElement) {
  @state() private showQR = false
  @state() private searchQuery = ''

  static styles: CSSResultGroup = css`
    :host { display: block; font-size: inherit; }
    .stack { display: flex; flex-direction: column; gap: 1em; }

    /* Header */
    .page-header { display: flex; align-items: center; gap: 0.5em; }
    .back-btn {
      padding: 0.375em; border-radius: 0.5em;
      background: none; border: none; cursor: pointer;
      color: var(--muted-foreground); transition: background 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .back-btn:hover { background: var(--secondary); }
    .back-btn svg { width: 1.25em; height: 1.25em; }
    .page-title { margin: 0; font-size: 1em; font-weight: 600; color: var(--foreground); }

    /* QR toggle */
    .qr-toggle {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 0.75em;
      background: var(--secondary); border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer; transition: background 0.15s; text-align: left;
    }
    .qr-toggle:hover {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .qr-toggle-left { display: flex; align-items: center; gap: 0.75em; }
    .qr-icon {
      width: 2.5em; height: 2.5em; border-radius: 0.5em; flex-shrink: 0;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .qr-icon svg { width: 1.25em; height: 1.25em; color: var(--primary); }
    .qr-text-name { font-size: 0.875em; font-weight: 500; color: var(--foreground); }
    .qr-text-desc { font-size: 0.75em; color: var(--muted-foreground); margin-top: 0.125em; }
    .qr-chevron { width: 1.25em; height: 1.25em; color: var(--muted-foreground); transition: transform 0.2s; }
    .qr-chevron.open { transform: rotate(180deg); }

    .qr-display {
      margin-top: 0.75em; padding: 1em;
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      display: flex; flex-direction: column; align-items: center; gap: 0.75em;
    }
    .qr-img-wrap { padding: 0.75em; background: #1a1a2e; border-radius: 0.75em; }
    .qr-img { width: 10em; height: 10em; border-radius: 0.5em; display: block; }
    .qr-caption { font-size: 0.75em; color: var(--muted-foreground); text-align: center; }

    /* Search */
    .search-wrap { position: relative; }
    .search-icon {
      position: absolute; left: 0.75em; top: 50%; transform: translateY(-50%);
      width: 1em; height: 1em; color: var(--muted-foreground); pointer-events: none;
    }
    .search-input {
      width: 100%; box-sizing: border-box;
      padding: 0.625em 1em 0.625em 2.25em;
      background: var(--secondary); border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      font-size: 0.875em; color: var(--foreground);
      outline: none; transition: border-color 0.15s;
    }
    .search-input::placeholder { color: var(--muted-foreground); }
    .search-input:focus { border-color: var(--primary); }

    /* Players list */
    .list-label { font-size: 0.75em; color: var(--muted-foreground); padding: 0 0.25em; }
    .players-list {
      display: flex; flex-direction: column; gap: 0.375em;
      max-height: 13em; overflow-y: auto;
      margin-top: 0.375em;
    }
    .player-btn {
      width: 100%; display: flex; align-items: center; gap: 0.75em;
      padding: 0.75em;
      background: var(--secondary); border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer; transition: background 0.15s; text-align: left;
    }
    .player-btn:hover {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .player-avatar {
      position: relative; flex-shrink: 0;
      width: 2.5em; height: 2.5em; border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875em; font-weight: 600; color: var(--primary);
    }
    .player-info { flex: 1; min-width: 0; }
    .player-name { font-size: 0.875em; font-weight: 500; color: var(--foreground); }
    .player-sub  { font-size: 0.75em; color: var(--muted-foreground); margin-top: 0.125em; }
    .player-chevron { width: 1em; height: 1em; color: var(--muted-foreground); flex-shrink: 0; }

    .empty-msg {
      font-size: 0.875em; color: var(--muted-foreground);
      text-align: center; padding: 1em;
    }

    a-button { display: block; width: 100%; }
    .btn-icon { display: inline; margin-right: 0.375em; vertical-align: -0.125em; }
  `

  protected render() {
    const players = foundAuraPlayersFromContact.get()
    const brightId = userBrightId.get()

    const filtered = players.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    )

    const qrData = encodeURIComponent(`aura://connect/${brightId || 'new-user'}`)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}&bgcolor=1a1a2e&color=4ade80`

    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="page-title">Find Aura Players</h2>
        </div>

        <!-- QR section -->
        <div>
          <button class="qr-toggle" @click=${() => this.showQR = !this.showQR}>
            <div class="qr-toggle-left">
              <div class="qr-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <div class="qr-text-name">Show my QR Code</div>
                <div class="qr-text-desc">Let others scan to connect</div>
              </div>
            </div>
            <svg class="qr-chevron ${this.showQR ? 'open' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          ${this.showQR ? html`
            <div class="qr-display">
              <div class="qr-img-wrap">
                <img class="qr-img" src=${qrUrl} alt="Your Aura QR Code" />
              </div>
              <p class="qr-caption">Others can scan this to connect and evaluate you</p>
            </div>
          ` : ''}
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            class="search-input"
            type="text"
            placeholder="Search players…"
            .value=${this.searchQuery}
            @input=${(e: Event) => this.searchQuery = (e.target as HTMLInputElement).value}
          />
        </div>

        <!-- Players -->
        <div>
          <p class="list-label">From your contacts (${filtered.length})</p>
          <div class="players-list">
            ${filtered.length === 0
              ? html`<p class="empty-msg">No players found</p>`
              : filtered.map(player => html`
                <button class="player-btn" @click=${() => this._emit('select-player', player.value)}>
                  <div class="player-avatar">
                    ${player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-sub">${player.value.slice(0, 10)}…</div>
                  </div>
                  <svg class="player-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              `)
            }
          </div>
        </div>

        <a-button variant="secondary" size="sm"
          @click=${() => window.open('https://brightid.app', '_blank')}>
          <svg class="btn-icon" width="1em" height="1em" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Scan QR Code
        </a-button>
      </div>
    `
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))
  }
}
