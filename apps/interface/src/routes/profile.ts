import '@/components/common/profile-card';
import { pushRouter } from '@/router';
import {
  userBrightId,
  userEmail,
  userFirstName,
  userLastName,
  userProfilePicture,
} from '@/states/user';
import { createBlockiesImage } from '@/utils/image';
import { SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('profile-page')
export class ProfilePage extends SignalWatcher(LitElement) {
  static styles = css`
    .heading {
      margin-bottom: 8px;
    }
    .eyebrow {
      color: var(--muted-foreground);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 6px;
    }
    a-button {
      margin-top: 16px;
    }
    a-text {
      overflow-wrap: anywhere;
    }
  `;

  constructor() {
    super();
    if (!userBrightId.get()) pushRouter('/login');
  }

  protected render() {
    if (!userBrightId.get()) return html``;
    const email = userEmail.get();
    const brightId = userBrightId.get();
    const who = email || (brightId ? `${brightId.slice(0, 10)}…` : '');

    return html`
      <header class="heading">
        <p class="eyebrow">Aura / Verified</p>
        <a-head level="1">Profile</a-head>
      </header>
      <profile-card
        .firstName=${userFirstName.get()}
        .lastName=${userLastName.get()}
        .email=${email}
        .image=${userProfilePicture.get() || createBlockiesImage(brightId)}
      ></profile-card>
      <a-text variant="muted">Signed in as ${who}</a-text>
      <a-button variant="outline" @click=${() => pushRouter('/home')}>
        Back home
      </a-button>
    `;
  }
}
