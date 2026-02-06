import { signal } from '@lit-labs/signals'

export const privateKey = signal('')
export const publicKey = signal(null as null | Uint8Array<ArrayBufferLike>)
export const aesKey = signal('')
export const brightIDKeyGenerationTimestamp = signal(null as number | null)

export const recoveryId = signal('' as string | null)
