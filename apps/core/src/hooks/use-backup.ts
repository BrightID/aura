import { createMemo } from "solid-js"
import { createProfileDataQuery } from "@/queries/backup"
import { authStore } from "@/store/auth"

/** The decrypted BrightID backup for the logged-in user. */
export function useBackup() {
  return createProfileDataQuery(
    () => authStore.user?.brightId ?? "",
    () => authStore.user?.password ?? "",
  )
}

/**
 * Resolve display names from the backup (self or a connection); falls back to
 * a short id. Use this when a component renders many subjects — it shares one
 * backup query across all lookups.
 */
export function useNameResolver() {
  const backup = useBackup()
  return (id: string): string => {
    const data = backup.data
    if (!data) return id.slice(0, 7)
    const info =
      id === data.userData.id
        ? data.userData
        : data.connections.find((c) => c.id === id)
    return info?.name ?? id.slice(0, 7)
  }
}

/** Reactive display name for a single subject. */
export function useSubjectName(subjectId: () => string) {
  const nameOf = useNameResolver()
  return createMemo(() => nameOf(subjectId()))
}
