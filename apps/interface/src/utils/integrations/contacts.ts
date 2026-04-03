import { BASE_SALT_FOR_CONTACTS, normalizeContactValue } from '@/lib/constants/contacts'
import bcrypt from 'bcryptjs'

export type Contact = {
  names: {
    displayName: string
  }[]

  phoneNumbers?: { value: string; canonicalForm: string }[]
  emailAddresses?: { value: string }[]
  photos?: { url: string; default?: boolean }[]
}

const salt = BASE_SALT_FOR_CONTACTS

export async function extractHashsedSocialsFromContact(contact: Contact): Promise<string[]> {
  const res: string[] = []

  if (contact.phoneNumbers) {
    for (const phoneNumber of contact.phoneNumbers) {
      const hashed = await bcrypt.hash(
        normalizeContactValue(phoneNumber.canonicalForm ?? phoneNumber.value),
        salt
      )

      res.push(hashed)
    }
  }

  if (contact.emailAddresses) {
    for (const email of contact.emailAddresses) {
      const hashed = await bcrypt.hash(normalizeContactValue(email.value), salt)

      res.push(hashed)
    }
  }

  return res
}
