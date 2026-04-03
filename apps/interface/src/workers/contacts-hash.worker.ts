import bcrypt from 'bcryptjs'
import { BASE_SALT_FOR_CONTACTS, normalizeContactValue } from '@/lib/constants/contacts'
import type { Contact } from '@/utils/integrations/contacts'

export type ContactsHashWorkerInput = {
  contacts: Contact[]
}

export type ContactsHashWorkerOutput = {
  hashes: string[]
  hashMap: Record<string, { name: string | undefined; value: string; photo?: string }>
}

self.onmessage = async (e: MessageEvent<ContactsHashWorkerInput>) => {
  const { contacts } = e.data
  const hashes: string[] = []
  const hashMap: Record<string, { name: string | undefined; value: string; photo?: string }> = {}

  for (const contact of contacts) {
    const displayName = contact.names.at(0)?.displayName
    const photo = contact.photos?.find((p) => !p.default)?.url ?? contact.photos?.at(0)?.url
    const infos: string[] = [
      ...(contact.phoneNumbers ?? []).map((p) => p.canonicalForm ?? p.value),
      ...(contact.emailAddresses ?? []).map((e) => e.value),
    ]

    for (const value of infos) {
      const hash = await bcrypt.hash(normalizeContactValue(value), BASE_SALT_FOR_CONTACTS)
      hashes.push(hash)
      hashMap[hash] = { name: displayName, value, photo }
    }
  }

  const result: ContactsHashWorkerOutput = { hashes, hashMap }
  self.postMessage(result)
}
