import { icon } from '../icon';
import { LightElement } from '../light-element';
import {
  askedEvaluationPlayers,
  foundAuraPlayersFromContact,
  hasTriedFindingPlayers,
  sentPlayerLinks,
} from '@/lib/data/contacts';
import {
  userBrightId,
  userFirstName,
  userGravatarEmail,
  userLastName,
} from '@/states/user';
import type { AuraImpact } from '@/types/evaluation';
import { CORE_APP_URL } from './constants';

async function getGravatarHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

import { Mutation } from '@aura/query';
import { SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { clientAPI } from '@/utils/apis';
import type { Contact } from '@/utils/integrations/contacts';
import { parseContactsFile } from '@/utils/integrations/contacts-file';
import { getContactsList } from '@/utils/integrations/google';
import './level-badge';
import type { ContactsHashWorkerOutput } from '../workers/contacts-hash.worker';
import './shared-styles.css';
import './find-players.css';

@customElement('verification-find-players')
export class VerificationFindPlayersElement extends SignalWatcher(
  LightElement,
) {
  @property({ type: Array }) auraImpacts: AuraImpact[] = [];

  @state() private searchQuery = '';
  @state() private _copied = false;
  @state() private _shareTarget: {
    name: string;
    value: string;
    photo?: string;
  } | null = null;
  @state() private _shareTargetCopied = false;
  @state() private _myProfileUrl = '';

  override connectedCallback() {
    super.connectedCallback();
    this._buildProfileUrl().then((url) => {
      this._myProfileUrl = url;
    });
  }

  #googleImport = new Mutation<void, void>(this, {
    mutationFn: async () => {
      const contacts = await getContactsList();
      if (!contacts?.length) return;
      await this._processContacts(contacts);
    },
  });

  #fileImport = new Mutation<void, File>(this, {
    mutationFn: async (file: File) => {
      const contacts = await parseContactsFile(file);
      if (!contacts.length) return;
      await this._processContacts(contacts);
    },
  });

  protected render() {
    const players = foundAuraPlayersFromContact.get();
    const brightId = userBrightId.get();

    const filtered = players.filter((p) =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );

    const isImporting =
      this.#googleImport.isPending || this.#fileImport.isPending;
    const importError =
      this.#googleImport.error?.message ??
      this.#fileImport.error?.message ??
      '';

    return html`
      <div class="stack">
        <!-- Header -->
        <div class="header">
          <button
            class="back-btn"
            aria-label="Go back"
            @click=${() => this._emit('back')}
          >
            ${icon('lucide:chevron-left')}
          </button>
          <div class="header-text">
            <h2 class="header-title">Find Aura Players</h2>
            <p class="header-sub">
              Import contacts or share your profile to get evaluated
            </p>
          </div>
        </div>

        <!-- Profile share bar -->
        <div class="profile-bar">
          <div class="profile-bar-icon">${icon('lucide:link')}</div>
          <div class="profile-bar-info">
            <div class="profile-bar-label">Your profile link</div>
            <div class="profile-bar-desc">
              Send it to Aura players and ask for an evaluation
            </div>
          </div>
          <div class="profile-bar-actions">
            <button
              class="icon-btn solid ${this._copied ? 'success' : ''}"
              ?disabled=${!brightId}
              aria-label=${this._copied ? 'Copied' : 'Copy link'}
              @click=${() => this._copyProfileLink(brightId)}
            >
              ${icon(this._copied ? 'lucide:check' : 'lucide:copy')}
            </button>
            <button
              class="icon-btn ghost"
              ?disabled=${!brightId}
              aria-label="Share profile"
              @click=${() => this._shareProfileLink(brightId)}
            >
              ${icon('lucide:share-2')}
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
              ${icon('simple-icons:google')} Google Contacts
            </button>
            <button
              class="import-btn"
              ?disabled=${isImporting}
              @click=${() =>
                this.renderRoot
                  ?.querySelector<HTMLInputElement>('.file-input')
                  ?.click()}
            >
              ${icon('lucide:upload')} Import file
            </button>
            <input
              class="file-input"
              type="file"
              accept=".vcf,.csv"
              @change=${(e: Event) => this._onFileSelected(e)}
            />
          </div>
        </div>

        ${
          isImporting
            ? html`
                <div class="import-loading">
                  <div class="spinner"></div>
                  <span>Importing contacts… this may take a moment</span>
                </div>
              `
            : ''
        }
        ${importError ? html`<p class="error-msg">${importError}</p>` : ''}
        ${
          !isImporting && players.length === 0 && hasTriedFindingPlayers.get()
            ? html`
                <div class="discord-banner">
                  <div class="discord-icon">
                    ${icon('simple-icons:discord')}
                  </div>
                  <div class="discord-text">
                    <div class="discord-title">
                      No Aura players in your contacts?
                    </div>
                    <div class="discord-desc">
                      Find other players and get evaluated on our community
                      server
                    </div>
                  </div>
                  <a
                    class="discord-link"
                    href="https://discord.gg/pcWy6NqM"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join ${icon('lucide:external-link')}
                  </a>
                </div>
              `
            : ''
        }

        <!-- Search + list -->
        ${
          players.length > 0
            ? html`
                <div class="search-wrap">
                  <span class="search-icon"> ${icon('lucide:search')} </span>
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
            : ''
        }
      </div>
    `;
  }

  private _renderPlayers(
    filtered: { name: string; value: string; photo?: string }[],
  ) {
    const sent = sentPlayerLinks.get();
    const askedSet = new Set(askedEvaluationPlayers.get().map((p) => p.value));
    const evaluatedIds = new Set(this.auraImpacts.map((i) => i.evaluator));

    if (filtered.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">${icon('lucide:users')}</div>
          <p class="empty-title">No players found</p>
          <p class="empty-desc">Try a different name or import more contacts</p>
        </div>
      `;
    }

    const active = filtered.filter((p) => !evaluatedIds.has(p.value));
    const done = filtered.filter((p) => evaluatedIds.has(p.value));

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const renderCard = (player: {
      name: string;
      value: string;
      photo?: string;
    }) => {
      const isEvaluated = evaluatedIds.has(player.value);
      const isSent = sent.includes(player.value);
      const isAsked = askedSet.has(player.value);
      const isSelected = this._shareTarget?.value === player.value;
      const isEmail = player.value.includes('@');

      return html`
        <button
          class="player-card ${isEvaluated ? 'done' : ''} ${isSelected ? 'selected' : ''}"
          @click=${() => {
            this._shareTarget = isSelected ? null : player;
            this._shareTargetCopied = false;
          }}
        >
          <div class="player-avatar-wrap">
            <div class="player-avatar">
              ${
                player.photo
                  ? html`<img src=${player.photo} alt=${player.name} />`
                  : getInitials(player.name)
              }
            </div>
            ${isAsked && !isEvaluated ? html`<span class="sent-dot asked"></span>` : ''}
          </div>
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-credential">
              ${icon(isEmail ? 'lucide:mail' : 'lucide:phone', '', 'width: 0.75em; height: 0.75em')}
              ${player.value}
            </div>
          </div>
          ${
            isEvaluated
              ? html`<span class="eval-badge">
                  ${icon('lucide:check')} Evaluated
                </span>`
              : isAsked
                ? html`<span class="asked-badge">
                    ${icon('lucide:clock')} Asked
                  </span>`
                : html`<span class="card-chevron">
                    ${icon('lucide:chevron-right')}
                  </span>`
          }
        </button>
        ${
          isSelected
            ? html`
                <div class="share-strip">
                  <span class="share-strip-text">
                    Ask <strong>${player.name}</strong> to evaluate you
                  </span>
                  <button
                    class="icon-btn solid ${this._shareTargetCopied ? 'success' : ''}"
                    aria-label=${this._shareTargetCopied ? 'Copied' : 'Copy link'}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._copyForPlayer();
                    }}
                  >
                    ${icon(this._shareTargetCopied ? 'lucide:check' : 'lucide:copy')}
                  </button>
                  <button
                    class="icon-btn ghost"
                    aria-label="Share"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      this._shareForPlayer();
                    }}
                  >
                    ${icon('lucide:share-2')}
                  </button>
                </div>
              `
            : ''
        }
      `;
    };

    return html`
      <div>
        <div class="list-header" style="margin-bottom: 0.375em">
          <span class="list-count"
            >${filtered.length} player${filtered.length !== 1 ? 's' : ''}
            found</span
          >
        </div>
        <div class="players-list">
          ${active.map(renderCard)}
          ${
            done.length > 0
              ? html`
                  <div class="group-divider">Already evaluated you</div>
                  ${done.map(renderCard)}
                `
              : ''
          }
        </div>
      </div>
    `;
  }

  private async _buildProfileUrl(): Promise<string> {
    const brightId = userBrightId.get();
    if (!brightId) return '';
    let queryParams = '';
    const email = userGravatarEmail.get().trim();
    if (email) {
      const hash = await getGravatarHash(email);
      queryParams = '?gravatar=' + encodeURIComponent(hash);
    }
    const name = [userFirstName.get().trim(), userLastName.get().trim()]
      .filter(Boolean)
      .join(' ');
    if (name) {
      queryParams += queryParams
        ? '&name=' + encodeURIComponent(name)
        : '?name=' + encodeURIComponent(name);
    }
    return (
      `${CORE_APP_URL}/subject/${encodeURIComponent(brightId)}/` + queryParams
    );
  }

  private _upsertAsked(player: {
    name: string;
    value: string;
    photo?: string;
  }) {
    const asked = askedEvaluationPlayers.get();
    const idx = asked.findIndex((p) => p.value === player.value);
    if (idx >= 0) {
      const updated = [...asked];
      updated[idx] = {
        name: updated[idx]?.name ?? '',
        value: updated[idx]?.value ?? '',
        photo: updated[idx]?.photo,
        askedAt: Date.now(),
      };
      askedEvaluationPlayers.set(updated);
    } else {
      askedEvaluationPlayers.set([
        ...asked,
        { ...player, askedAt: Date.now() },
      ]);
    }
  }

  private async _copyForPlayer() {
    if (!this._shareTarget) return;
    const url = this._myProfileUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    const current = sentPlayerLinks.get();
    if (!current.includes(this._shareTarget.value)) {
      sentPlayerLinks.set([...current, this._shareTarget.value]);
    }
    this._upsertAsked(this._shareTarget);
    this._shareTargetCopied = true;
    setTimeout(() => (this._shareTargetCopied = false), 2000);
  }

  private _shareForPlayer() {
    if (!this._shareTarget) return;
    const url = this._myProfileUrl;
    if (!url) return;
    const target = this._shareTarget;
    if (navigator.share) {
      navigator
        .share({
          title: 'Evaluate me on Aura',
          text: `Hey ${target.name}, could you evaluate me on Aura? Here's my profile:`,
          url,
        })
        .then(() => {
          const current = sentPlayerLinks.get();
          if (!current.includes(target.value))
            sentPlayerLinks.set([...current, target.value]);
          this._upsertAsked(target);
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      this._shareTargetCopied = true;
      setTimeout(() => (this._shareTargetCopied = false), 2000);
      const current = sentPlayerLinks.get();
      if (!current.includes(target.value))
        sentPlayerLinks.set([...current, target.value]);
      this._upsertAsked(target);
    }
  }

  private async _copyProfileLink(_brightId: string | null) {
    const url = this._myProfileUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    this._copied = true;
    setTimeout(() => (this._copied = false), 2000);
  }

  private _shareProfileLink(_brightId: string | null) {
    const url = this._myProfileUrl;
    if (!url) return;
    if (navigator.share) {
      navigator
        .share({
          title: 'Aura Profile',
          text: 'Check out my Aura profile!',
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      this._copied = true;
      setTimeout(() => (this._copied = false), 2000);
    }
  }

  private _onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.#fileImport.mutate(file);
  }

  private async _processContacts(contacts: Contact[]) {
    const worker = new Worker(
      new URL('../workers/contacts-hash.worker.ts', import.meta.url),
      {
        type: 'module',
      },
    );

    const { hashes, hashMap } = await new Promise<ContactsHashWorkerOutput>(
      (resolve, reject) => {
        worker.onmessage = (e: MessageEvent<ContactsHashWorkerOutput>) =>
          resolve(e.data);
        worker.onerror = (err) => reject(new Error(err.message));
        worker.postMessage({ contacts });
      },
    );

    worker.terminate();

    if (!hashes.length) return;

    const result = await clientAPI.POST(
      '/check-aura-player' as never,
      { body: { hashes } } as never,
    );

    if (!result.data) return;

    const matchedHashes = (result as { data: { hash: string }[] }).data.map(
      (item) => item.hash,
    );
    const players = matchedHashes
      .map((hash) => hashMap[hash])
      .filter(
        (p): p is { name: string; value: string; photo?: string } =>
          !!p && !!p.name,
      );

    foundAuraPlayersFromContact.set(players);
    hasTriedFindingPlayers.set(true);
  }

  private _emit(event: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true, detail }),
    );
  }
}
