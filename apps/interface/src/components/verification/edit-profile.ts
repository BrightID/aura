import { userFirstName, userGravatarEmail, userLastName, userProfilePicture } from '@/states/user'
import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

async function getGravatarHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

@customElement('verification-edit-profile')
export class VerificationEditProfileElement extends LitElement {
  @state() private _firstName = ''
  @state() private _lastName = ''
  @state() private _gravatarEmail = ''
  @state() private _saving = false

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 0.875em;
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

    /* Purpose note */
    .purpose-note {
      display: flex;
      align-items: flex-start;
      gap: 0.4em;
      font-size: 0.75em;
      color: var(--muted-foreground);
      line-height: 1.5;
      margin: 0;
    }

    .purpose-note iconify-icon {
      width: 0.9em;
      height: 0.9em;
      flex-shrink: 0;
      margin-top: 0.3em;
    }

    /* Form */
    .form-card {
      display: flex;
      flex-direction: column;
      gap: 0.125em;
      padding: 0.875em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
    }

    /* Gravatar hint */
    .gravatar-hint {
      /*display: flex;
      align-items: center;
      justify-content: space-between;*/
      padding: 0.25em 0.125em 0.375em;
      font-size: 0.7em;
      color: var(--muted-foreground);
    }
    .gravatar-link {
      display: inline-flex;
      align-items: center;
      gap: 0.2em;
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
    .gravatar-link:hover {
      text-decoration: underline;
    }
    .gravatar-link iconify-icon {
      width: 0.75em;
      height: 0.75em;
    }
    .gravatar-link span {
      flex: 1 1 auto;
      width: 100%;
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 0.5em;
      justify-content: flex-end;
      padding-top: 0.625em;
      border-top: 1px solid var(--border);
      margin-top: 0.375em;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this._firstName = userFirstName.get()
    this._lastName = userLastName.get()
    this._gravatarEmail = userGravatarEmail.get()
  }

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <h2 class="title">Edit Profile</h2>
        </div>

        <p class="purpose-note">
          <iconify-icon icon="lucide:info"></iconify-icon>
          Your name and photo are embedded in the link you share with Aura players, making it easier
          for them to identify and evaluate you.
        </p>

        <div class="form-card">
          <a-input
            label="First Name"
            .value=${this._firstName}
            @change=${(e: CustomEvent) => {
              this._firstName = e.detail as string
            }}
          ></a-input>
          <a-input
            label="Last Name"
            .value=${this._lastName}
            @change=${(e: CustomEvent) => {
              this._lastName = e.detail as string
            }}
          ></a-input>
          <a-input
            label="Gravatar Email"
            type="email"
            placeholder="your@email.com"
            .value=${this._gravatarEmail}
            @change=${(e: CustomEvent) => {
              this._gravatarEmail = e.detail as string
            }}
          ></a-input>
          <div class="gravatar-hint">
            <span>Profile picture is pulled from Gravatar</span>
            <a
              class="gravatar-link"
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span> Create a Gravatar </span>
              <iconify-icon icon="lucide:external-link"></iconify-icon>
            </a>
          </div>

          <div class="actions">
            <a-button
              variant="ghost"
              size="sm"
              ?disabled=${this._saving}
              @click=${() => this._emit('back')}
            >
              Cancel
            </a-button>
            <a-button size="sm" ?disabled=${this._saving} @click=${() => this._save()}>
              ${this._saving ? 'Saving…' : 'Save'}
            </a-button>
          </div>
        </div>
      </div>
    `
  }

  private async _save() {
    this._saving = true
    try {
      userFirstName.set(this._firstName)
      userLastName.set(this._lastName)

      const email = this._gravatarEmail.trim()
      userGravatarEmail.set(email)

      if (email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        const hash = await getGravatarHash(email)
        userProfilePicture.set(`https://gravatar.com/avatar/${hash}?s=80&d=mp`)
      } else if (!email) {
        userProfilePicture.set('')
      }

      this._emit('back')
    } finally {
      this._saving = false
    }
  }

  private _emit(event: string) {
    this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }))
  }
}
