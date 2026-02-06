import contactsIcon from '@/assets/icons/contacts.svg'
import googleIcon from '@/assets/icons/google.svg'
import { contactsList, foundAuraPlayersFromContact, hashedContactsList } from '@/lib/data/contacts'
import { clientAPI } from '@/utils/apis'
import { extractHashsedSocialsFromContact } from '@/utils/integrations/contacts'
import { getContactsList } from '@/utils/integrations/google'
// import appleIcon from '@/assets/icons/apple.svg'

import { signal, SignalWatcher } from '@lit-labs/signals'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'

const isTried = signal(false)

@customElement('contacts-section')
export class ContactsSection extends SignalWatcher(LitElement) {
  static styles?: CSSResultGroup | undefined = css`
    .card {
      background: linear-gradient(to bottom, rgba(46, 51, 90, 0.26), rgba(28, 27, 51, 0.26) 100%);
      box-shadow: 0px 1px 0px 0px #ffffff40 inset;
      backdrop-filter: blur(31.5px);
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: left;
      margin-bottom: 2rem;
    }

    .muted {
      color: #999999;
      font-size: 14px;
    }

    .text-xs {
      font-size: 12px;
    }

    .title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: bold;
      font-size: 20px;
    }

    a {
      text-decoration: none;
      color: #bfb3f8;
      font-weight: bold;
    }

    .integrations {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 5px;
    }

    button {
      /* padding: 5px 22px; */
      /* background: linear-gradient(to bottom, rgba(46, 51, 90, 0.26), rgba(28, 27, 51, 0.26) 100%); */
      background-color: transparent;
      cursor: pointer;
      outline: none;
      border: none;
      color: white;
    }

    .contact-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px;
      margin: 8px;
      background: #ffffff1a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
    }

    .contact-header {
      font-size: 1.25rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px;
    }

    .contact-value {
      font-size: 1rem;
      color: #cfcfcf;
      margin: 0;
    }

    hr {
      border-color: #45454b;
      margin: 20px;
    }
  `

  constructor() {
    super()
  }

  protected async onGoogleContactsClick() {
    const res = await getContactsList()

    if (!res?.length) return

    contactsList.set(res)

    const hashContacts = await Promise.all(
      res.map((item) => extractHashsedSocialsFromContact(item))
    )

    hashedContactsList.set(hashContacts.flat())

    const contactsHashMap = hashContacts.reduce((prev, curr, index) => {
      const contact = res[index]

      const infos = [...(contact?.phoneNumbers ?? []), ...(contact?.emailAddresses ?? [])]

      let count = 0

      for (const hash of curr) {
        prev[hash] = {
          name: contact?.names.at(0)?.displayName,
          value: infos[count]?.value
        }

        count++
      }

      return prev
    }, {} as Record<string, any>)

    const playersFetch = await clientAPI.POST(
      '/check-aura-player' as never,
      {
        body: {
          hashes: hashedContactsList.get()
        }
      } as never
    )

    if (!playersFetch.data) return

    isTried.set(true)

    const players = (playersFetch as { data: { hash: string }[] }).data.map((item) => item.hash)

    const importedContacts = players.map((hash) => {
      return contactsHashMap[hash]
    })

    foundAuraPlayersFromContact.set(importedContacts)
  }

  protected openContactMethod(contact: string): void {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(contact)) {
      window.location.href = `mailto:${contact}`
    } else if (/^\+?[\d\s-]{10,}$/.test(contact)) {
      window.location.href = `sms:${contact}`
    } else {
      console.error('Invalid email or phone number')
    }
  }

  protected render() {
    return html` <div class="card">
      <div class="title">
        <img src="${contactsIcon}" width="24" height="24" alt="contacts" />
        Search Contacts for Verifiers
      </div>

      <p class="muted">Discover who in your contacts is in Aura.</p>

      ${isTried.get() && foundAuraPlayersFromContact.get().length === 0
        ? html`<p>No Contacts Found in aura</p>`
        : foundAuraPlayersFromContact.get().length > 0
        ? html`<p>Aura Players List</p>`
        : ``}
      ${map(
        foundAuraPlayersFromContact.get(),
        (contact) => html`
          <div class="contact-card">
            <div>
              <h5 class="contact-header">${contact.name}</h5>
              <p class="contact-value">${contact.value}</p>
            </div>
            <button @click=${this.openContactMethod.bind(null, contact.value)}>Contact</button>
          </div>
        `
      )}
      <hr />
      <div class="integrations">
        <button @click=${this.onGoogleContactsClick}>
          <img .src=${googleIcon} width="39" height="39px" alt="google" />
          <p>Google</p>
        </button>
      </div>

      <p class="muted text-xs">This is completely private, <a href="#">learn more</a></p>
    </div>`
  }
}
