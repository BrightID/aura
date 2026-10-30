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
import { css, CSSResultGroup, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

const isTried = signal(false);

@customElement('contacts-section')
export class ContactsSection extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup | undefined = css`
    .title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .title img {
      flex-shrink: 0;
    }

    .title a-head {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    a {
      color: var(--primary);
      font-weight: 600;
    }

    .integrations {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .integrations a-button::part(button) {
      height: auto;
      gap: 8px;
      padding: 8px 12px;
    }

    .contact-card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 10px;
      margin: 8px 0;
      background: color-mix(in oklch, var(--foreground) 6%, transparent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .contact-copy {
      min-width: 0;
    }

    .contact-card a-button {
      flex-shrink: 0;
    }

    .contact-header {
      font-size: 1rem;
      font-weight: 600;
      color: var(--foreground);
      margin: 0 0 4px;
      overflow-wrap: anywhere;
    }

    .contact-value {
      font-size: 0.875rem;
      color: var(--muted-foreground);
      margin: 0;
      overflow-wrap: anywhere;
    }

    .divider {
      border: 0;
      border-top: 1px solid var(--border);
      margin: 16px 0;
    }

    .note {
      margin-top: 12px;
    }
  `;

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
    return html` <a-card variant="default">
      <div class="title">
        <img src="${contactsIcon}" width="24" height="24" alt="" />
        <a-head level="3">Search Contacts for Verifiers</a-head>
      </div>

      <a-text variant="muted">Discover who in your contacts is in Aura.</a-text>

      ${
        isTried.get() && foundAuraPlayersFromContact.get().length === 0
          ? html`<a-text variant="muted">No contacts found in Aura.</a-text>`
          : foundAuraPlayersFromContact.get().length > 0
            ? html`<a-text>Aura players</a-text>`
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
            <a-button
              size="sm"
              variant="outline"
              @click=${() => this.openContactMethod(contact.value)}
            >
              Contact
            </a-button>
          </div>
        `,
      )}
      <hr class="divider" />
      <div class="integrations">
        <a-button variant="outline" @click=${this.onGoogleContactsClick}>
          <img .src=${googleIcon} width="24" height="24" alt="" />
          Google
        </a-button>
      </div>

      <a-text variant="muted" size="xs" class="note">
        This is completely private, <a href="#">learn more</a>
      </a-text>
    </a-card>`;
  }
}
