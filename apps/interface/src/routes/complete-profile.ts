import { pushRouter } from '@/router';
import { userFirstName, userLastName } from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement } from 'lit/decorators.js';

const name = signal('');

@customElement('complete-profile')
export class CompleteProfile extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
    }

    .intro {
      margin-bottom: 20px;
    }

    a-text {
      margin: 8px 0 16px;
    }

    .actions {
      display: grid;
      gap: 12px;
      margin-top: 8px;
    }

    .actions a-button {
      width: 100%;
    }

    a {
      color: var(--primary);
      white-space: nowrap;
    }
  `;

  private onNameChange(event: Event) {
    const detail = (event as CustomEvent<string>).detail;
    name.set(typeof detail === 'string' ? detail : '');
  }

  private onSkip() {
    pushRouter('/home');
  }

  private onSubmit() {
    const [firstName, lastName] = name.get().trim().split(/\s+/, 2);
    userFirstName.set(firstName ?? '');
    userLastName.set(lastName ?? '');
    pushRouter('/home');
  }

  protected render() {
    return html`
      <div class="intro">
        <a-head level="1">Complete your info</a-head>
        <a-text variant="muted">
          Add the name other players should see.
          <a href="https://brightid.gitbook.io/aura" target="_blank" rel="noreferrer">
            What is Aura?
          </a>
        </a-text>
      </div>
      <a-card variant="default">
        <a-input
          label="Name"
          placeholder="Enter your name"
          .value=${name.get()}
          @change=${this.onNameChange}
        ></a-input>
        <div class="actions">
          <a-button @click=${this.onSubmit}>Continue</a-button>
          <a-button variant="outline" @click=${this.onSkip}>Skip</a-button>
        </div>
      </a-card>
    `;
  }
}
