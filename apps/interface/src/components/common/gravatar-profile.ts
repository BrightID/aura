import { LightElement } from '@aura/widgets/light-element';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html, PropertyDeclaration } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './gravatar-profile.css';

const response = signal(
  null as {
    display_name: string;
    profile_url: string;
    avatar_url: string;
  } | null,
);

@customElement('gravatar-profile')
export class GravatarProfile extends SignalWatcher(LightElement) {
  @property({
    type: String,
  })
  hashedEmail?: string;

  constructor() {
    super();
  }

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration,
  ): void {
    super.requestUpdate(name, oldValue, options);

    if (name === 'hashedEmail') this.onEmailChange();
  }

  protected async onEmailChange() {
    if (!this.hashedEmail) {
      response.set(null);
      return;
    }

    const profileUrl = `https://api.gravatar.com/v3/profiles/${this.hashedEmail}`;

    const profile = await fetch(profileUrl).then((res) => res.json());

    if (!profile?.hash) {
      response.set(null);
      return;
    }

    response.set(profile);
  }

  protected render() {
    if (!response.get())
      return html`
        <div class="container-prompt">
          Add a Gravatar email so players can see a name and photo.
          <a target="_blank" href="https://gravatar.com"
            >Create a Gravatar account</a
          >
        </div>
      `;

    return html`
      <div class="container">
        <img src="${response.get()!.avatar_url}" alt="Avatar" />
        <h2>${response.get()!.display_name}</h2>
        <a href="${response.get()!.profile_url}" target="_blank"
          >View Profile</a
        >
      </div>
    `;
  }
}
