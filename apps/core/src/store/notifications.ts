import { makePersisted } from "@solid-primitives/storage"
import { createStore } from "solid-js/store"
import type {
  NotificationAlert,
  TrackedProfiles,
} from "@aura/domain/notifications"

const MAX_ALERTS = 100

export interface NotificationsState {
  tracked: TrackedProfiles
  alerts: NotificationAlert[]
  lastFetch: number | null
}

const [notificationsStore, setNotificationsStore] = makePersisted(
  createStore<NotificationsState>({
    tracked: {},
    alerts: [],
    lastFetch: null,
  }),
)

/** Merge a diff result: dedupe by id, newest first, capped. */
export function ingestNotifications(
  result: { alerts: NotificationAlert[]; tracked: TrackedProfiles },
  now: number,
): void {
  setNotificationsStore((prev) => {
    const known = new Set(prev.alerts.map((a) => a.id))
    const fresh = result.alerts.filter((a) => !known.has(a.id))
    const alerts = [...fresh, ...prev.alerts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_ALERTS)
    return { ...prev, alerts, tracked: result.tracked, lastFetch: now }
  })
}

export function markAsRead(id: string): void {
  setNotificationsStore("alerts", (a) => a.id === id, "viewed", true)
}

export function markAllAsRead(): void {
  setNotificationsStore("alerts", {}, "viewed", true)
}

export function unreadCount(): number {
  return notificationsStore.alerts.filter((a) => !a.viewed).length
}

export { notificationsStore, setNotificationsStore }
