import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"

export type ContactType = "email" | "phone"

export interface StoredContact {
  type: ContactType
  /** bcrypt hash of the normalized value — the raw contact is never stored. */
  hash: string
}

export interface ContactsState {
  stored: StoredContact[]
}

const [contactsStore, setContactsStore] = makePersisted(
  createStore<ContactsState>({
    stored: [],
  }),
)

export function addContact(contact: StoredContact): void {
  if (contactsStore.stored.some((c) => c.hash === contact.hash)) return
  setContactsStore("stored", (prev) => [...prev, contact])
}

export { contactsStore, setContactsStore }
