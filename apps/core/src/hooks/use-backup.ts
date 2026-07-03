import { createMemo } from "solid-js"
import { createProfileDataQuery } from "@/queries/backup"
import { authStore } from "@/store/auth"

export function useBackup() {
  return createProfileDataQuery(
    () => authStore.user?.brightId ?? "",
    () => authStore.user?.password ?? "",
  )
}

/** Backup name lookup; `undefined` when the backup doesn't know the id. */
export function useNameLookup() {
  const backup = useBackup()
  return (id: string): string | undefined => {
    const data = backup.data
    if (!data) return undefined
    const info =
      id === data.userData.id
        ? data.userData
        : data.connections.find((c) => c.id === id)
    return info?.name
  }
}

export function useNameResolver() {
  const lookup = useNameLookup()
  return (id: string): string => lookup(id) ?? id.slice(0, 7)
}

/** `fallback` fills in for ids the backup can't resolve (e.g. `?name=`). */
export function useSubjectName(
  subjectId: () => string,
  fallback?: () => string | undefined,
) {
  const lookup = useNameLookup()
  return createMemo(() => {
    const id = subjectId()
    return lookup(id) ?? fallback?.() ?? id.slice(0, 7)
  })
}
