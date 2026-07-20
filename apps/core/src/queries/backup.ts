import { createQuery, queryOptions } from "@tanstack/solid-query"
import { getText, RECOVERY_API_BASE } from "@/shared/lib/api"
import { decryptData, hash } from "@aura/domain/crypto"
import type { BrightIdBackup } from "@aura/domain/types/aura"

/** Raw (still-encrypted) backup blob — keyed by the auth key `hash(id+pw)`. */
export const encryptedUserDataQueryOptions = (key: string) =>
  queryOptions({
    queryKey: ["encrypted-user-data", key],
    queryFn: ({ signal }) =>
      getText(`${RECOVERY_API_BASE}/backups/${key}/data`, signal),
    staleTime: 5_000_000,
    enabled: !!key,
  })

/** Decrypted BrightID backup (user data + connections). */
export const profileDataQueryOptions = (brightId: string, password: string) => {
  // Auth key derived from id+password — used as the cache key so the raw
  // password never lands in the query key (and thus never in devtools/storage).
  const key = brightId && password ? hash(brightId + password) : ""
  return queryOptions({
    queryKey: ["profile-data", key],
    queryFn: async ({ signal }) => {
      const text = await getText(`${RECOVERY_API_BASE}/backups/${key}/data`, signal)
      return JSON.parse(decryptData(text, password)) as BrightIdBackup
    },
    retry: 0,
    staleTime: 5_000_000,
    enabled: !!brightId && !!password,
  })
}

/** Decrypted profile photo (base64), stored per-connection in the backup. */
export const profilePhotoQueryOptions = (
  key: string,
  brightId: string,
  password: string,
) =>
  queryOptions({
    queryKey: ["profile-photo", key, brightId],
    queryFn: async ({ signal }) => {
      const text = await getText(
        `${RECOVERY_API_BASE}/backups/${key}/${brightId}`,
        signal,
      )
      return decryptData(text, password)
    },
    retry: 0,
    staleTime: 5_000_000,
    enabled: !!key && !!brightId && !!password,
  })

// ─── Solid query hooks ──────────────────────────────────────────────────────

export const createProfileDataQuery = (
  brightId: () => string,
  password: () => string,
) => createQuery(() => profileDataQueryOptions(brightId(), password()))

export const createProfilePhotoQuery = (
  key: () => string,
  brightId: () => string,
  password: () => string,
) => createQuery(() => profilePhotoQueryOptions(key(), brightId(), password()))
