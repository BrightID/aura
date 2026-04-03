import { Contact } from '@/utils/integrations/contacts'
import { signal } from '@lit-labs/signals'
import { localStorageSignal } from '../state'

export const isContactsLoading = signal(false)

export const contactsList = localStorageSignal(
  'contacts',
  [] as Contact[],
  (value) => JSON.parse(value ?? '[]'),
  (value) => JSON.stringify(value)
)

export const hashedContactsList = localStorageSignal<string[]>(
  'contactsHashed',
  [] as string[],
  (value) => JSON.parse(value ?? '[]'),
  (value) => JSON.stringify(value)
)

export const foundAuraPlayersFromContact = localStorageSignal<
  { name: string; value: string; photo?: string }[]
>(
  'auraPlayers',
  [],
  (value) => JSON.parse(value ?? '[]'),
  (value) => JSON.stringify(value)
)

export const hasTriedFindingPlayers = localStorageSignal(
  'hasTriedFindingPlayers',
  false,
  (value) => JSON.parse(value ?? 'false'),
  (value) => JSON.stringify(value)
)

export const sentPlayerLinks = localStorageSignal<string[]>(
  'sentPlayerLinks',
  [],
  (value) => JSON.parse(value ?? '[]'),
  (value) => JSON.stringify(value)
)

export const askedEvaluationPlayers = localStorageSignal<
  { name: string; value: string; photo?: string; askedAt: number }[]
>(
  'askedEvaluationPlayers',
  [],
  (value) => JSON.parse(value ?? '[]'),
  (value) => JSON.stringify(value)
)
