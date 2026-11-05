import { LightElement } from '@aura/widgets/light-element';
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
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './profile.css';

@customElement('profile-page')
export class ProfilePage extends SignalWatcher(LightElement) {
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
        <h1 class="a-head" data-level="1">Profile</h1>
      </header>
      <profile-card
        .firstName=${userFirstName.get()}
        .lastName=${userLastName.get()}
        .email=${email}
        .image=${userProfilePicture.get() || createBlockiesImage(brightId)}
      ></profile-card>
      <p class="a-text" data-variant="muted">Signed in as ${who}</p>
      <button
        class="a-button"
        type="button"
        data-variant="outline"
        @click=${() => pushRouter('/home')}
      >
        Back home
      </button>
    `;
  }
}
