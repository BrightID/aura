import { icon } from '../icon';
import { LightElement } from '../light-element';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  userFirstName,
  userGravatarEmail,
  userLastName,
  userProfilePicture,
} from '@/states/user';
import './shared-styles.css';
import './edit-profile.css';

async function getGravatarHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

@customElement('verification-edit-profile')
export class VerificationEditProfileElement extends LightElement {
  @state() private _firstName = '';
  @state() private _lastName = '';
  @state() private _gravatarEmail = '';
  @state() private _saving = false;

  connectedCallback() {
    super.connectedCallback();
    this._firstName = userFirstName.get();
    this._lastName = userLastName.get();
    this._gravatarEmail = userGravatarEmail.get();
  }

  protected render() {
    return html`
      <div class="stack">
        <div class="page-header">
          <button
            class="back-btn"
            aria-label="Go back"
            @click=${() => this._emit('back')}
          >
            ${icon('lucide:chevron-left')}
          </button>
          <h2 class="title">Edit Profile</h2>
        </div>

        <p class="purpose-note">
          ${icon('lucide:info')} Your name and photo are embedded in the link
          you share with Aura players, making it easier for them to identify and
          evaluate you.
        </p>

        <div class="form-card">
          <label class="a-field">
            First Name
            <input
              class="a-input"
              .value=${this._firstName}
              @input=${(e: Event) => {
                this._firstName = (e.target as HTMLInputElement).value;
              }}
            />
          </label>
          <label class="a-field">
            Last Name
            <input
              class="a-input"
              .value=${this._lastName}
              @input=${(e: Event) => {
                this._lastName = (e.target as HTMLInputElement).value;
              }}
            />
          </label>
          <label class="a-field">
            Gravatar Email
            <input
              class="a-input"
              type="email"
              placeholder="your@email.com"
              .value=${this._gravatarEmail}
              @input=${(e: Event) => {
                this._gravatarEmail = (e.target as HTMLInputElement).value;
              }}
            />
          </label>
          <div class="gravatar-hint">
            <span>Profile picture is pulled from Gravatar</span>
            <a
              class="gravatar-link"
              href="https://gravatar.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span> Create a Gravatar </span>
              ${icon('lucide:external-link')}
            </a>
          </div>

          <div class="actions">
            <button
              class="a-button"
              type="button"
              data-variant="ghost"
              data-size="sm"
              ?disabled=${this._saving}
              @click=${() => this._emit('back')}
            >
              Cancel
            </button>
            <button
              class="a-button"
              type="button"
              data-size="sm"
              ?disabled=${this._saving}
              @click=${() => this._save()}
            >
              ${this._saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private async _save() {
    this._saving = true;
    try {
      userFirstName.set(this._firstName);
      userLastName.set(this._lastName);

      const email = this._gravatarEmail.trim();
      userGravatarEmail.set(email);

      if (email && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        const hash = await getGravatarHash(email);
        userProfilePicture.set(`https://gravatar.com/avatar/${hash}?s=80&d=mp`);
      } else if (!email) {
        userProfilePicture.set('');
      }

      this._emit('back');
    } finally {
      this._saving = false;
    }
  }

  private _emit(event: string) {
    this.dispatchEvent(
      new CustomEvent(event, { bubbles: true, composed: true }),
    );
  }
}
