import { LightElement } from '@aura/widgets/light-element';
import contactsIcon from '@/assets/icons/contacts.svg';
import googleIcon from '@/assets/icons/google.svg';
import {
  contactsList,
  foundAuraPlayersFromContact,
  hashedContactsList,
} from '@/lib/data/contacts';
import { clientAPI } from '@/utils/apis';
import { extractHashsedSocialsFromContact } from '@/utils/integrations/contacts';
import { getContactsList } from '@/utils/integrations/google';
// import appleIcon from '@/assets/icons/apple.svg'

import { signal, SignalWatcher } from '@lit-labs/signals';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import './contacts-section.css';

const isTried = signal(false);

@customElement('contacts-section')
export class ContactsSection extends SignalWatcher(LightElement) {
  constructor() {
    super();
  }

  protected async onGoogleContactsClick() {
    const res = await getContactsList();

    if (!res?.length) return;

    contactsList.set(res);

    const hashContacts = await Promise.all(
      res.map((item) => extractHashsedSocialsFromContact(item)),
    );

    hashedContactsList.set(hashContacts.flat());

    const contactsHashMap = hashContacts.reduce(
      (prev, curr, index) => {
        const contact = res[index];

        const infos = [
          ...(contact?.phoneNumbers ?? []),
          ...(contact?.emailAddresses ?? []),
        ];

        let count = 0;

        for (const hash of curr) {
          prev[hash] = {
            name: contact?.names.at(0)?.displayName,
            value: infos[count]?.value,
          };

          count++;
        }

        return prev;
      },
      {} as Record<string, any>,
    );

    const playersFetch = await clientAPI.POST(
      '/check-aura-player' as never,
      {
        body: {
          hashes: hashedContactsList.get(),
        },
      } as never,
    );

    if (!playersFetch.data) return;

    isTried.set(true);

    const players = (playersFetch as { data: { hash: string }[] }).data.map(
      (item) => item.hash,
    );

    const importedContacts = players.map((hash) => {
      return contactsHashMap[hash];
    });

    foundAuraPlayersFromContact.set(importedContacts);
  }

  protected openContactMethod(contact: string): void {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(contact)) {
      window.location.href = `mailto:${contact}`;
    } else if (/^\+?[\d\s-]{10,}$/.test(contact)) {
      window.location.href = `sms:${contact}`;
    } else {
      console.error('Invalid email or phone number');
    }
  }

  protected render() {
    return html` <div class="a-card" data-variant="default">
      <div class="title">
        <img src="${contactsIcon}" width="24" height="24" alt="" />
        <h3 class="a-head" data-level="3">Search Contacts for Verifiers</h3>
      </div>

      <p class="a-text" data-variant="muted">
        Discover who in your contacts is in Aura.
      </p>

      ${
        isTried.get() && foundAuraPlayersFromContact.get().length === 0
          ? html`<p class="a-text" data-variant="muted">
              No contacts found in Aura.
            </p>`
          : foundAuraPlayersFromContact.get().length > 0
            ? html`<p class="a-text">Aura players</p>`
            : ``
      }
      ${map(
        foundAuraPlayersFromContact.get(),
        (contact) => html`
          <div class="contact-card">
            <div class="contact-copy">
              <h5 class="contact-header">${contact.name}</h5>
              <p class="contact-value">${contact.value}</p>
            </div>
            <button
              class="a-button"
              type="button"
              data-size="sm"
              data-variant="outline"
              @click=${() => this.openContactMethod(contact.value)}
            >
              Contact
            </button>
          </div>
        `,
      )}
      <hr class="divider" />
      <div class="integrations">
        <button
          class="a-button"
          type="button"
          data-variant="outline"
          @click=${this.onGoogleContactsClick}
        >
          <img .src=${googleIcon} width="24" height="24" alt="" />
          Google
        </button>
      </div>

      <p class="a-text note" data-variant="muted" data-size="xs">
        This is completely private, <a href="#">learn more</a>
      </p>
    </div>`;
  }
}
