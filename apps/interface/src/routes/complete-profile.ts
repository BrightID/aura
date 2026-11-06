import { LightElement } from '@aura/widgets/light-element';
import { pushRouter } from '@/router';
import { userFirstName, userLastName } from '@/states/user';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './complete-profile.css';

const name = signal('');

@customElement('complete-profile')
export class CompleteProfile extends SignalWatcher(LightElement) {
  private onNameChange(event: Event) {
    name.set((event.target as HTMLInputElement).value);
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
        <h1 class="a-head" data-level="1">Complete your info</h1>
        <p class="a-text" data-variant="muted">
          Add the name other players should see.
          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noreferrer"
          >
            What is Aura?
          </a>
        </p>
      </div>
      <div class="a-card" data-variant="default">
        <label class="a-field">
          Name
          <input
            class="a-input"
            placeholder="Enter your name"
            .value=${name.get()}
            @input=${this.onNameChange}
          />
        </label>
        <div class="actions">
          <button class="a-button" type="button" @click=${this.onSubmit}>
            Continue
          </button>
          <button
            class="a-button"
            type="button"
            data-variant="outline"
            @click=${this.onSkip}
          >
            Skip
          </button>
        </div>
      </div>
    `;
  }
}
