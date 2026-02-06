import { localStorageSignal } from '@/lib/state'
import { signal } from '@lit-labs/signals'

export const userEmail = localStorageSignal('_email', '')
export const userBrightId = localStorageSignal('_brightId', '')
export const userFirstName = localStorageSignal('_firstName', '')
export const userLastName = localStorageSignal('_lastName', '')
export const userProfilePicture = localStorageSignal(
  '_profilePicture',
  '',
  (value) => value ?? '',
  (value) => value?.toString() ?? ''
)
export const userPhoneNumber = localStorageSignal('_phoneNumber', '')

export const levelUpProgress = signal(
  [] as {
    reason: string
    status: 'passed' | 'incomplete'
    level: number
  }[]
)
