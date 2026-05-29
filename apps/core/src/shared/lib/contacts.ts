import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Salt is intentionally fixed so the same contact yields the same hash on the server.
export const BASE_SALT_FOR_CONTACTS = '$2a$12$abcdefghijklmnopqrstuv';

export const normalizeContactValue = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  const phone = parsePhoneNumberFromString(trimmed);
  if (phone?.isValid()) return phone.format('E.164');
  return trimmed.toLowerCase();
};
