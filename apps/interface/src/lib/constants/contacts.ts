import { parsePhoneNumberFromString } from 'libphonenumber-js'

// This is for making the hash value harder to compute, and prevent brute forcing the hash actual value
export const BASE_SALT_FOR_CONTACTS = '$2a$12$abcdefghijklmnopqrstuv'

export const normalizeContactValue = (value: string): string => {
  const trimmed = value.trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  const phone = parsePhoneNumberFromString(trimmed)
  if (phone?.isValid()) return phone.format('E.164')
  return trimmed.toLowerCase()
}
