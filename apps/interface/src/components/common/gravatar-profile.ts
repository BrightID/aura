import { signal, SignalWatcher } from '@lit-labs/signals';
import {
  css,
  html,
  LitElement,
  PropertyDeclaration,
  type CSSResultGroup,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';

const response = signal(
  null as {
    display_name: string;
    profile_url: string;
    avatar_url: string;
  } | null,
);

@customElement('gravatar-profile')
export class GravatarProfile extends SignalWatcher(LitElement) {
  @property({
    type: String,
  })
  hashedEmail?: string;

  static styles?: CSSResultGroup | undefined = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0;
      max-width: 100%;
      margin: 0;
    }
    img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 1.5rem;
      margin: 0 0 8px;
      color: var(--foreground);
      overflow-wrap: anywhere;
    }
    a {
      color: var(--primary);
      text-decoration: none;
      font-size: 1rem;
    }
    a:hover {
      text-decoration: underline;
    }
    div:empty {
      font-size: 1rem;
      color: var(--muted-foreground);
      text-align: center;
      padding: 16px;
    }

    .container-prompt {
      text-align: left;
      font-size: 14px;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
  `;

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
          <a target="_blank" href="https://gravatar.com">Create a Gravatar account</a>
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
