import bcrypt from 'bcryptjs'
import { BASE_SALT_FOR_CONTACTS } from '@/lib/constants/contacts'
import type { Contact } from '@/utils/integrations/contacts'

export type ContactsHashWorkerInput = {
  contacts: Contact[]
}

export type ContactsHashWorkerOutput = {
  hashes: string[]
  hashMap: Record<string, { name: string | undefined; value: string }>
}

self.onmessage = async (e: MessageEvent<ContactsHashWorkerInput>) => {
  const { contacts } = e.data
  const hashes: string[] = []
  const hashMap: Record<string, { name: string | undefined; value: string }> = {}

  for (const contact of contacts) {
    const displayName = contact.names.at(0)?.displayName
    const infos: string[] = [
      ...(contact.phoneNumbers ?? []).map((p) => p.canonicalForm ?? p.value),
      ...(contact.emailAddresses ?? []).map((e) => e.value),
    ]

    for (const value of infos) {
      const hash = await bcrypt.hash(value, BASE_SALT_FOR_CONTACTS)
      hashes.push(hash)
      hashMap[hash] = { name: displayName, value }
    }
  }

  const result: ContactsHashWorkerOutput = { hashes, hashMap }
  self.postMessage(result)
}
