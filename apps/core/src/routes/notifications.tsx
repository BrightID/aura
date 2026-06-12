import { useNavigate } from "@solidjs/router"
import { createMemo, createSignal, For, Show } from "solid-js"
import { useNameResolver } from "@/hooks/use-backup"
import { useRequireSession } from "@/hooks/use-require-session"
import {
  markAllAsRead,
  markAsRead,
  notificationsStore,
  unreadCount,
} from "@/store/notifications"
import { compactFormat } from "@/shared/lib/number"
import { formatDuration } from "@/shared/lib/time"
import { categoryLabel } from "@aura/domain/labels"
import type { NotificationAlert } from "@aura/domain/notifications"
import { EvaluationCategory } from "@aura/domain/types/evaluations"

const CATEGORY_FILTERS: { label: string; value: EvaluationCategory | null }[] = [
  { label: "All", value: null },
  ...Object.values(EvaluationCategory).map((c) => ({
    label: categoryLabel[c],
    value: c as EvaluationCategory | null,
  })),
]

const KIND_ICON: Record<NotificationAlert["kind"], string> = {
  evaluation: "user-check",
  "score-increase": "trending-up",
  "score-decrease": "trending-down",
  "level-increase": "arrow-up",
  "level-decrease": "arrow-down",
}

/** /notifications — alerts produced by the notifications checker. */
export default function NotificationsPage() {
  const subjectId = useRequireSession()
  const navigate = useNavigate()
  const resolveName = useNameResolver()
  const [filter, setFilter] = createSignal<EvaluationCategory | null>(null)

  const nameOf = (id: string) =>
    id === subjectId() ? "You" : resolveName(id)

  const title = (a: NotificationAlert) => {
    switch (a.kind) {
      case "evaluation":
        return a.to === subjectId()
          ? `${nameOf(a.about)} evaluated you`
          : `${nameOf(a.about)} evaluated ${nameOf(a.to ?? "")}`
      case "level-increase":
        return a.about === subjectId()
          ? `Your level increased to ${a.next}`
          : `${nameOf(a.about)} leveled up to ${a.next}`
      case "level-decrease":
        return a.about === subjectId()
          ? `Your level decreased to ${a.next}`
          : `${nameOf(a.about)}'s level decreased to ${a.next}`
      case "score-increase":
        return a.about === subjectId()
          ? `Your score increased to ${compactFormat(a.next ?? 0)}`
          : `${nameOf(a.about)}'s score increased to ${compactFormat(a.next ?? 0)}`
      case "score-decrease":
        return a.about === subjectId()
          ? `Your score dropped to ${compactFormat(a.next ?? 0)}`
          : `${nameOf(a.about)}'s score dropped to ${compactFormat(a.next ?? 0)}`
    }
  }

  const alerts = createMemo(() => {
    const f = filter()
    return notificationsStore.alerts.filter((a) => !f || a.category === f)
  })

  const open = (a: NotificationAlert) => {
    markAsRead(a.id)
    const target = a.about === subjectId() ? a.to : a.about
    if (target) navigate(`/subject/${target}`)
  }

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <div class="flex items-center justify-between">
        <a-head class="text-2xl">Notifications</a-head>
        <Show when={unreadCount() > 0}>
          <a-button
            size="sm"
            variant="glass"
            data-testid="notifications-mark-all"
            onClick={markAllAsRead}
          >
            Mark all as read
          </a-button>
        </Show>
      </div>

      <div class="flex flex-wrap gap-2">
        <For each={CATEGORY_FILTERS}>
          {(c) => (
            <a-button
              size="sm"
              variant="glass"
              color="secondary"
              selected={filter() === c.value}
              data-testid={`notifications-filter-${c.label.toLowerCase()}`}
              onClick={() => setFilter(c.value)}
            >
              {c.label}
            </a-button>
          )}
        </For>
      </div>

      <Show
        when={alerts().length > 0}
        fallback={
          <div class="py-10 text-center text-muted-foreground">
            Nothing here yet — new evaluations and level or score changes will
            show up here.
          </div>
        }
      >
        <div class="flex flex-col gap-3">
          <For each={alerts()}>
            {(alert) => (
              <a-card
                interactive
                data-testid={`notification-${alert.id}`}
                class="flex w-full items-center gap-3 p-4"
                onClick={() => open(alert)}
              >
                <a-icon name={KIND_ICON[alert.kind]} />
                <div class="flex flex-1 flex-col">
                  <p
                    class={`text-sm ${alert.viewed ? "text-muted-foreground" : "font-medium text-foreground"}`}
                  >
                    {title(alert)}
                  </p>
                  <p class="text-xs text-muted-foreground/70">
                    <span class="capitalize">{alert.category}</span> ·{" "}
                    {formatDuration(alert.timestamp)}
                  </p>
                </div>
                <Show when={!alert.viewed}>
                  <span class="bg-primary h-2.5 w-2.5 rounded-full" />
                </Show>
              </a-card>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
