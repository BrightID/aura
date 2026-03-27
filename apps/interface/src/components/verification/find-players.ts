import googleIcon from '@/assets/icons/google.svg'
import { foundAuraPlayersFromContact } from '@/lib/data/contacts'
import { userBrightId, userFirstName, userGravatarEmail, userLastName } from '@/states/user'

async function getGravatarHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
import { clientAPI } from '@/utils/apis'
import { parseContactsFile } from '@/utils/integrations/contacts-file'
import type { Contact } from '@/utils/integrations/contacts'
import { getContactsList } from '@/utils/integrations/google'
import { Mutation } from '@aura/query'
import { SignalWatcher } from '@lit-labs/signals'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import './level-badge'
import type { ContactsHashWorkerOutput } from '@/workers/contacts-hash.worker'

@customElement('verification-find-players')
export class VerificationFindPlayersElement extends SignalWatcher(LitElement) {
  @state() private searchQuery = ''
  @state() private _copied = false

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
    .stack {
      display: flex;
      flex-direction: column;
      gap: 1em;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .back-btn {
      padding: 0.375em;
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
    .page-title {
      margin: 0;
      font-size: 1em;
      font-weight: 600;
      color: var(--foreground);
    }

    /* Copy link */
    .copy-row {
      display: flex;
      align-items: center;
      gap: 0.875em;
      padding: 0.875em 1em;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.05);
      border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.18);
      border-radius: var(--radius, 0.75rem);
    }
    .copy-row-icon {
      width: 2.25em;
      height: 2.25em;
      border-radius: 0.5em;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--primary);
    }
    .copy-row-icon iconify-icon {
      width: 1em;
      height: 1em;
    }
    .copy-row-info {
      flex: 1;
      min-width: 0;
    }
    .copy-row-name {
      font-size: 0.8em;
      font-weight: 600;
      color: var(--foreground);
    }
    .copy-row-desc {
      font-size: 0.72em;
      color: var(--muted-foreground);
      margin-top: 0.15em;
    }
    .copy-btn {
      display: flex;
      align-items: center;
      gap: 0.375em;
      flex-shrink: 0;
      padding: 0.5em 0.875em;
      border-radius: 0.5em;
      border: none;
      background: var(--primary);
      cursor: pointer;
      font-size: 0.775em;
      font-weight: 600;
      color: var(--primary-foreground, #fff);
      transition: background 0.2s, transform 0.1s;
    }
    .copy-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary) 85%, black 15%);
    }
    .copy-btn:active:not(:disabled) {
      transform: scale(0.96);
    }
    .copy-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .copy-btn.copied {
      background: var(--aura-success, #22c55e);
    }
    .copy-btn iconify-icon {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }

    /* Search */
    .search-wrap {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 0.75em;
      top: 50%;
      transform: translateY(-50%);
      width: 1em;
      height: 1em;
      color: var(--muted-foreground);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 0.625em 1em 0.625em 2.25em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      font-size: 0.875em;
      color: var(--foreground);
      outline: none;
      transition: border-color 0.15s;
    }
    .search-input::placeholder {
      color: var(--muted-foreground);
    }
    .search-input:focus {
      border-color: var(--primary);
    }

    /* Import buttons */
    .import-row {
      display: flex;
      gap: 0.5em;
    }
    .import-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
      padding: 0.625em 0.75em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.8em;
      font-weight: 500;
      color: var(--foreground);
    }
    .import-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .import-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .import-btn img {
      width: 1.125em;
      height: 1.125em;
      flex-shrink: 0;
    }
    .import-btn iconify-icon {
      width: 1.125em;
      height: 1.125em;
      flex-shrink: 0;
    }
    .file-input {
      display: none;
    }

    /* Loading */
    .import-loading {
      display: flex;
      align-items: center;
      gap: 0.625em;
      padding: 0.625em 0.75em;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.07);
      border: 1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15);
      border-radius: var(--radius, 0.75rem);
      font-size: 0.8em;
      color: var(--muted-foreground);
    }

    /* Players list */
    .list-label {
      font-size: 0.75em;
      color: var(--muted-foreground);
      padding: 0 0.25em;
    }
    .players-list {
      display: flex;
      flex-direction: column;
      gap: 0.375em;
      max-height: 13em;
      overflow-y: auto;
      margin-top: 0.375em;
    }
    .player-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75em;
      padding: 0.75em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
    }
    .player-btn:hover {
      background: color-mix(in srgb, var(--secondary) 80%, var(--foreground) 5%);
    }
    .player-avatar {
      position: relative;
      flex-shrink: 0;
      width: 2.5em;
      height: 2.5em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875em;
      font-weight: 600;
      color: var(--primary);
    }
    .player-info {
      flex: 1;
      min-width: 0;
    }
    .player-name {
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
    }
    .player-sub {
      font-size: 0.75em;
      color: var(--muted-foreground);
      margin-top: 0.125em;
    }
    .player-chevron {
      width: 1em;
      height: 1em;
      color: var(--muted-foreground);
      flex-shrink: 0;
    }

    .empty-msg {
      font-size: 0.875em;
      color: var(--muted-foreground);
      text-align: center;
      padding: 1em;
    }

    .spinner {
      width: 1em;
      height: 1em;
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

    a-button {
      width: 100%;
    }

    .btn-icon {
      display: inline;
      margin-right: 0.375em;
      vertical-align: -0.125em;
    }

    .error-msg {
      padding: 0.5em 0.75em;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 0.5em;
      font-size: 0.75em;
      color: var(--destructive);
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
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <h2 class="page-title">Find Aura Players</h2>
        </div>

        <!-- Copy profile link -->
        <div class="copy-row">
          <div class="copy-row-icon">
            <iconify-icon icon="lucide:share-2"></iconify-icon>
          </div>
          <div class="copy-row-info">
            <div class="copy-row-name">Share my profile</div>
            <div class="copy-row-desc">Send this link to Aura players to get verified</div>
          </div>
          <button
            class="copy-btn ${this._copied ? 'copied' : ''}"
            ?disabled=${!brightId}
            @click=${() => this._copyProfileLink(brightId)}
          >
            <iconify-icon icon=${this._copied ? 'lucide:check' : 'lucide:copy'}></iconify-icon>
            ${this._copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <iconify-icon icon="lucide:search" class="search-icon"></iconify-icon>
          <input
            class="search-input"
            type="text"
            placeholder="Search players…"
            .value=${this.searchQuery}
            @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
          />
        </div>

        <!-- Import contacts -->
        <div class="import-row">
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
            @click=${() => this.shadowRoot?.querySelector<HTMLInputElement>('.file-input')?.click()}
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

        ${isImporting
          ? html`
              <div class="import-loading">
                <div class="spinner"></div>
                <span>Importing contacts… this may take a moment</span>
              </div>
            `
          : ''}
        ${importError ? html`<p class="error-msg">${importError}</p>` : ''}

        <!-- Players -->
        <div>
          <p class="list-label">From your contacts (${filtered.length})</p>
          <div class="players-list">
            ${filtered.length === 0
              ? html`<p class="empty-msg">No players found</p>`
              : filtered.map(
                  (player) => html`
                    <button
                      class="player-btn"
                      @click=${() => this._emit('select-player', player.value)}
                    >
                      <div class="player-avatar">
                        ${player.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        <div class="player-sub">${player.value.slice(0, 10)}…</div>
                      </div>
                      <iconify-icon icon="lucide:chevron-right" class="player-chevron"></iconify-icon>
                    </button>
                  `
                )}
          </div>
        </div>

        <a-button
          variant="secondary"
          size="sm"
          @click=${() => window.open('https://brightid.app', '_blank')}
        >
          <iconify-icon icon="lucide:camera" class="btn-icon" width="1em" height="1em"></iconify-icon>
          Scan QR Code
        </a-button>
      </div>
    `
  }

  private async _copyProfileLink(brightId: string | null) {
    if (!brightId) return

    let queryParams = ''

    const email = userGravatarEmail.get().trim()
    if (email) {
      const hash = await getGravatarHash(email)
      queryParams = '?gravatar=' + encodeURIComponent(hash)
    }

    const firstName = userFirstName.get().trim()
    const lastName = userLastName.get().trim()
    const name = [firstName, lastName].filter(Boolean).join(' ')
    if (name) {
      queryParams +=
        queryParams.length > 0
          ? '&name=' + encodeURIComponent(name)
          : '?name=' + encodeURIComponent(name)
    }

    const url = `https://aura-dev.vercel.app/subject/${encodeURIComponent(brightId)}/` + queryParams
    await navigator.clipboard.writeText(url)
    this._copied = true
    setTimeout(() => (this._copied = false), 2000)
  }

  private _onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    input.value = '' // reset so same file can be re-selected
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
      {
        body: { hashes }
      } as never
    )

    if (!result.data) return

    const matchedHashes = (result as { data: { hash: string }[] }).data.map((item) => item.hash)
    const players = matchedHashes
      .map((hash) => hashMap[hash])
      .filter((p): p is { name: string; value: string } => !!p && !!p.name)

    foundAuraPlayersFromContact.set(players)
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))
  }
}
