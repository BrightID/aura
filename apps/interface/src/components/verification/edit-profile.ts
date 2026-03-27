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
      gap: 1.25em;
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

    /* Form card */
    .form-card {
      padding: 1.25em;
      background: var(--secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius, 0.75rem);
      display: flex;
      flex-direction: column;
      gap: 0.25em;
    }

    /* Avatar preview */
    .avatar-row {
      display: flex;
      align-items: center;
      gap: 1em;
      padding-bottom: 1em;
      border-bottom: 1px solid var(--border);
      margin-bottom: 0.5em;
    }
    .avatar-preview {
      width: 3.5em;
      height: 3.5em;
      border-radius: 9999px;
      background: rgba(var(--primary-rgb, 99, 102, 241), 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-preview iconify-icon {
      color: var(--primary);
    }
    .avatar-label {
      flex: 1;
    }
    .avatar-label-title {
      font-size: 0.875em;
      font-weight: 500;
      color: var(--foreground);
    }
    .avatar-label-desc {
      font-size: 0.75em;
      color: var(--muted-foreground);
      margin-top: 0.125em;
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 0.5em;
      justify-content: flex-end;
      padding-top: 0.75em;
      border-top: 1px solid var(--border);
      margin-top: 0.5em;
    }
  `

  connectedCallback() {
    super.connectedCallback()
    this._firstName = userFirstName.get()
    this._lastName = userLastName.get()
    this._gravatarEmail = userGravatarEmail.get()
  }

  protected render() {
    const pic = userProfilePicture.get()
    return html`
      <div class="stack">
        <div class="page-header">
          <button class="back-btn" aria-label="Go back" @click=${() => this._emit('back')}>
            <iconify-icon icon="lucide:chevron-left"></iconify-icon>
          </button>
          <h2 class="title">Edit Profile</h2>
        </div>

        <div class="form-card">
          <div class="avatar-row">
            <div class="avatar-preview">
              ${pic
                ? html`<img src=${pic} alt="avatar" />`
                : html`<iconify-icon icon="lucide:user" width="1.5em" height="1.5em"></iconify-icon>`}
            </div>
            <div class="avatar-label">
              <div class="avatar-label-title">Profile Picture</div>
              <div class="avatar-label-desc">Set via Gravatar email below</div>
            </div>
          </div>

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

          <div class="actions">
            <a-button variant="ghost" size="sm" ?disabled=${this._saving} @click=${() => this._emit('back')}>
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
