import type { Contact } from './contacts'

/**
 * Parse a .vcf (vCard) file text into Contact[].
 * Handles vCard 2.1, 3.0, and 4.0 formats.
 */
export function parseVcf(text: string): Contact[] {
  const contacts: Contact[] = []
  // Split into individual vCard blocks
  const blocks = text.split(/BEGIN:VCARD/i).slice(1)

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    const contact: Contact = { names: [] }

    let displayName = ''
    const phoneNumbers: Contact['phoneNumbers'] = []
    const emailAddresses: Contact['emailAddresses'] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.toUpperCase() === 'END:VCARD') continue

      // FN (full name)
      const fnMatch = trimmed.match(/^FN(?:;[^:]*)?:(.*)/i)
      if (fnMatch) {
        displayName = fnMatch[1].trim()
        continue
      }

      // TEL — phone number
      const telMatch = trimmed.match(/^TEL(?:;[^:]*)?:(.*)/i)
      if (telMatch) {
        const value = telMatch[1].trim()
        if (value) phoneNumbers.push({ value, canonicalForm: value })
        continue
      }

      // EMAIL
      const emailMatch = trimmed.match(/^EMAIL(?:;[^:]*)?:(.*)/i)
      if (emailMatch) {
        const value = emailMatch[1].trim()
        if (value) emailAddresses.push({ value })
        continue
      }
    }

    if (!displayName && phoneNumbers.length === 0 && emailAddresses.length === 0) continue

    contact.names = displayName ? [{ displayName }] : [{ displayName: 'Unknown' }]
    if (phoneNumbers.length > 0) contact.phoneNumbers = phoneNumbers
    if (emailAddresses.length > 0) contact.emailAddresses = emailAddresses

    contacts.push(contact)
  }

  return contacts
}

/**
 * Parse a Google Contacts CSV export into Contact[].
 * Expected columns: "Name", "Phone 1 - Value", "E-mail 1 - Value" (and higher numbers).
 */
export function parseCsv(text: string): Contact[] {
  const contacts: Contact[] = []
  const lines = text.split(/\r?\n/)
  if (lines.length < 2) return contacts

  const headers = parseCsvRow(lines[0])

  const nameIdx = headers.findIndex((h) => h.toLowerCase() === 'name')

  // Collect all phone and email column indices
  const phoneIndices = headers
    .map((h, i) => (/phone.*value/i.test(h) ? i : -1))
    .filter((i) => i !== -1)
  const emailIndices = headers
    .map((h, i) => (/e[-\s]?mail.*value/i.test(h) ? i : -1))
    .filter((i) => i !== -1)

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cols = parseCsvRow(line)
    const displayName = nameIdx !== -1 ? cols[nameIdx]?.trim() ?? '' : ''

    const phoneNumbers: Contact['phoneNumbers'] = []
    for (const idx of phoneIndices) {
      const value = cols[idx]?.trim()
      if (value) phoneNumbers.push({ value, canonicalForm: value })
    }

    const emailAddresses: Contact['emailAddresses'] = []
    for (const idx of emailIndices) {
      const value = cols[idx]?.trim()
      if (value) emailAddresses.push({ value })
    }

    if (!displayName && phoneNumbers.length === 0 && emailAddresses.length === 0) continue

    contacts.push({
      names: [{ displayName: displayName || 'Unknown' }],
      ...(phoneNumbers.length > 0 ? { phoneNumbers } : {}),
      ...(emailAddresses.length > 0 ? { emailAddresses } : {}),
    })
  }

  return contacts
}

/** Read a File and parse it as a contacts list based on its extension/mime type. */
export function parseContactsFile(file: File): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        if (file.name.toLowerCase().endsWith('.vcf') || file.type === 'text/vcard') {
          resolve(parseVcf(text))
        } else {
          resolve(parseCsv(text))
        }
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read contacts file'))
    reader.readAsText(file)
  })
}

/** Minimal CSV row parser that handles quoted fields. */
function parseCsvRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}
