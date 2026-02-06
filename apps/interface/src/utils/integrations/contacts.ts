import { BASE_SALT_FOR_CONTACTS } from '@/lib/constants/contacts'
import bcrypt from 'bcryptjs'

export type Contact = {
  names: {
    displayName: string
  }[]

  phoneNumbers?: { value: string; canonicalForm: string }[]
  emailAddresses?: { value: string }[]
}

const salt = BASE_SALT_FOR_CONTACTS

export async function extractHashsedSocialsFromContact(contact: Contact): Promise<string[]> {
  const res: string[] = []

  if (contact.phoneNumbers) {
    for (const phoneNumber of contact.phoneNumbers) {
      const hashed = await bcrypt.hash(phoneNumber.canonicalForm ?? phoneNumber.value, salt)

      res.push(hashed)
    }
  }

  if (contact.emailAddresses) {
    for (const email of contact.emailAddresses) {
      const hashed = await bcrypt.hash(email.value, salt)

      res.push(hashed)
    }
  }

  return res
}
