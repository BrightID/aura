import localforage from "localforage"
import { useContactsStore } from "./contacts.store"
import { useKeypairStore } from "./keypair.store"
import {
  NotificationObject,
  useNotificationsStore,
} from "./notifications.store"
import { useProfileStore } from "./profile.store"
import { useSettingsStore } from "./settings.store"
import { useUserStore } from "./user.store"

const LEGACY_KEY = "persist:root"
const MIGRATION_DONE_KEY = "redux-to-zustand-migrated"

export async function migrateLegacyReduxStore() {
  try {
    const done = await localforage.getItem(MIGRATION_DONE_KEY)
    if (done) return

    const raw = await localforage.getItem<Record<string, unknown>>(LEGACY_KEY)
    if (!raw) {
      await localforage.setItem(MIGRATION_DONE_KEY, true)
      return
    }

    const parse = <T>(key: string): T | null => {
      try {
        const val = raw[key]
        return typeof val === "string" ? JSON.parse(val) : (val as T)
      } catch {
        return null
      }
    }

    const user = parse<Record<string, unknown>>("user")
    if (user && !useUserStore.getState().id) {
      useUserStore.setState({
        id: (user.id as string) ?? "",
        name: (user.name as string) ?? "",
        password: (user.password as string) ?? "",
        secretKey: (user.secretKey as string) ?? "",
        photo: (user.photo as { filename: string }) ?? { filename: "" },
        eula: (user.eula as boolean) ?? false,
        isSponsored: (user.isSponsored as boolean) ?? false,
        isSponsoredv6: (user.isSponsoredv6 as boolean) ?? false,
        backupCompleted: (user.backupCompleted as boolean) ?? false,
        verifications: (user.verifications as Verification[]) ?? [],
        updateTimestamps:
          (user.updateTimestamps as UserState["updateTimestamps"]) ?? {
            backupCompleted: 0,
            isSponsored: 0,
            isSponsoredv6: 0,
            photo: 0,
            name: 0,
            password: 0,
          },
        localServerUrl: (user.localServerUrl as string) ?? "",
      })
    }

    const settings = parse<Record<string, unknown>>("settings")
    if (settings) {
      useSettingsStore.setState({
        baseUrl: settings.baseUrl as string | null,
        nodeUrls: (settings.nodeUrls as string[]) ?? [],
        isPrimaryDevice: (settings.isPrimaryDevice as boolean) ?? true,
        lastSyncTime: (settings.lastSyncTime as number) ?? 0,
        languageTag: settings.languageTag as string | null,
        prefferedTheme: (settings.prefferedTheme as "dark" | "light") ?? "dark",
        hasManagerRole: (settings.hasManagerRole as number) ?? 0,
        hasTrainerRole: (settings.hasTrainerRole as number) ?? 0,
      })
    }

    const keypair = parse<Record<string, string>>("keypair")
    if (keypair && !useKeypairStore.getState().publicKey) {
      useKeypairStore.setState({
        publicKey: keypair.publicKey ?? "",
        secretKey: keypair.secretKey ?? "",
      })
    }

    const profile = parse<Record<string, unknown>>("profile")
    if (profile && !useProfileStore.getState().authData) {
      useProfileStore.setState({
        authData: profile.authData as {
          brightId: string
          password: string
        } | null,
        brightIdBackupEncrypted: profile.brightIdBackupEncrypted as
          | string
          | null,
        splashScreenShown: (profile.splashScreenShown as boolean) ?? false,
        playerOnboardingScreenShown:
          (profile.playerOnboardingScreenShown as boolean) ?? false,
      })
    }

    const contacts = parse<Record<string, unknown>>("contacts")
    if (contacts?.storedInfoHashed) {
      useContactsStore.setState({
        storedInfoHashed: contacts.storedInfoHashed as {
          type: string
          value: string
        }[],
      })
    }

    const alerts = parse<Record<string, unknown>>("alerts")
    if (alerts) {
      useNotificationsStore.setState({
        alerts: (alerts.alerts as NotificationObject[]) ?? [],
        lastFetch: alerts.lastFetch as number | null,
      })
    }

    await localforage.removeItem(LEGACY_KEY)
    await localforage.setItem(MIGRATION_DONE_KEY, true)
  } catch (e) {
    console.warn("Legacy store migration failed:", e)
  }
}
