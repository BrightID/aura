import { useEffect, useRef, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Mail,
  CreditCard,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

import { auth, db } from "~/lib/firebase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationChannel {
  paymentSuccess: boolean
  paymentFailed: boolean
  planActivated: boolean
  usageLow: boolean
  usageExhausted: boolean
  projectUpdates: boolean
  securityAlerts: boolean
}

interface EmailNotifications extends NotificationChannel {
  productUpdates: boolean
}

interface NotificationPrefs {
  email: EmailNotifications
  inApp: NotificationChannel
}

type EventType = "success" | "error" | "warning" | "info"

interface NotificationEvent {
  id: string
  title: string
  type: EventType
  timestamp: Date
  read: boolean
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultPrefs: NotificationPrefs = {
  email: {
    paymentSuccess: true,
    paymentFailed: true,
    planActivated: true,
    usageLow: false,
    usageExhausted: true,
    projectUpdates: false,
    securityAlerts: true,
    productUpdates: false,
  },
  inApp: {
    paymentSuccess: true,
    paymentFailed: true,
    planActivated: true,
    usageLow: false,
    usageExhausted: true,
    projectUpdates: false,
    securityAlerts: true,
  },
}

// ─── Notification row config ──────────────────────────────────────────────────

type EmailKey = keyof EmailNotifications
type InAppKey = keyof NotificationChannel

interface NotificationRow<K extends string> {
  key: K
  label: string
  description: string
  icon: React.ReactNode
}

const emailRows: NotificationRow<EmailKey>[] = [
  {
    key: "paymentSuccess",
    label: "Payment confirmed",
    description: "When a payment successfully processes",
    icon: <CreditCard className="size-4 text-green-500" />,
  },
  {
    key: "paymentFailed",
    label: "Payment failed",
    description: "When a payment fails or expires",
    icon: <CreditCard className="size-4 text-red-500" />,
  },
  {
    key: "planActivated",
    label: "Subscription activated",
    description: "When your plan is upgraded",
    icon: <Zap className="size-4 text-yellow-500" />,
  },
  {
    key: "usageLow",
    label: "Low token usage",
    description: "When you've used 90% of your tokens",
    icon: <AlertTriangle className="size-4 text-amber-500" />,
  },
  {
    key: "usageExhausted",
    label: "Tokens exhausted",
    description: "When you've run out of tokens",
    icon: <AlertTriangle className="size-4 text-red-500" />,
  },
  {
    key: "projectUpdates",
    label: "Project updates",
    description: "When project settings are changed",
    icon: <MessageSquare className="size-4 text-blue-500" />,
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "New sign-in from unknown device or password change",
    icon: <Shield className="size-4 text-violet-500" />,
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "New features and changelog (weekly digest)",
    icon: <Info className="size-4 text-muted-foreground" />,
  },
]

const inAppRows: NotificationRow<InAppKey>[] = emailRows
  .filter((r) => r.key !== "productUpdates")
  .map((r) => r as NotificationRow<InAppKey>)

// ─── Event type styling ───────────────────────────────────────────────────────

const eventIconMap: Record<EventType, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />,
  error: <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />,
  warning: <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />,
  info: <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />,
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-4 mt-0.5 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
              <Skeleton className="h-[1.15rem] w-8 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  id: string
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onCheckedChange: (val: boolean) => void
}

function ToggleRow({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <Label
            htmlFor={id}
            className="text-sm font-medium leading-none cursor-pointer"
          >
            {label}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [user] = useAuthState(auth)
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<NotificationEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // Debounce timer ref — one timer per field key
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load prefs ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return

    async function loadPrefs() {
      try {
        const ref = doc(db, "notifications", user!.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          setPrefs(snap.data() as NotificationPrefs)
        } else {
          // Create document with defaults
          await setDoc(ref, defaultPrefs)
          setPrefs(defaultPrefs)
        }
      } catch (err) {
        console.error("Failed to load notification prefs:", err)
        setPrefs(defaultPrefs)
      } finally {
        setLoading(false)
      }
    }

    loadPrefs()
  }, [user])

  // ── Load notification history ─────────────────────────────────────────────

  useEffect(() => {
    if (!user) return

    async function loadEvents() {
      try {
        const eventsRef = collection(
          db,
          "notifications_log",
          user!.uid,
          "events"
        )
        const q = query(eventsRef, orderBy("timestamp", "desc"), limit(10))
        const snap = await getDocs(q)

        const loaded: NotificationEvent[] = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title ?? "Notification",
            type: (data.type as EventType) ?? "info",
            timestamp: data.timestamp?.toDate?.() ?? new Date(),
            read: data.read ?? true,
          }
        })

        setEvents(loaded)
      } catch {
        // Collection may not exist — silently ignore
        setEvents([])
      } finally {
        setEventsLoading(false)
      }
    }

    loadEvents()
  }, [user])

  // ── Persist a single toggle immediately (debounced 500ms) ─────────────────

  function handleToggle(
    channel: "email" | "inApp",
    key: EmailKey | InAppKey,
    value: boolean
  ) {
    if (!user || !prefs) return

    // Optimistic update
    setPrefs((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [channel]: { ...prev[channel], [key]: value },
      }
    })

    // Debounce the Firestore write
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const ref = doc(db, "notifications", user.uid)
        await updateDoc(ref, { [`${channel}.${key}`]: value })
        toast.success("Preferences saved")
      } catch (err) {
        console.error("Failed to save notification pref:", err)
        toast.error("Failed to save preferences")
        // Revert optimistic update
        setPrefs((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            [channel]: { ...prev[channel], [key]: !value },
          }
        })
      }
    }, 500)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Control how and when you receive updates
        </p>
      </div>

      <div className="px-4 lg:px-6 flex flex-col gap-6">
        {/* ── Email Notifications ─────────────────────────────────────────── */}
        {loading ? (
          <>
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <CardTitle>Email Notifications</CardTitle>
                </div>
                <CardDescription>
                  Choose which events send you an email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {emailRows.map((row) => (
                    <ToggleRow
                      key={row.key}
                      id={`email-${row.key}`}
                      icon={row.icon}
                      label={row.label}
                      description={row.description}
                      checked={prefs?.email[row.key] ?? false}
                      onCheckedChange={(val) =>
                        handleToggle("email", row.key, val)
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── In-App Notifications ────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="size-4" />
                  <CardTitle>In-App Notifications</CardTitle>
                </div>
                <CardDescription>
                  Manage alerts shown inside the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {inAppRows.map((row) => (
                    <ToggleRow
                      key={row.key}
                      id={`inApp-${row.key}`}
                      icon={row.icon}
                      label={row.label}
                      description={row.description}
                      checked={prefs?.inApp[row.key] ?? false}
                      onCheckedChange={(val) =>
                        handleToggle("inApp", row.key, val)
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Notification History ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              Your 10 most recent in-app notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-4 rounded-full mt-0.5 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Bell className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {events.map((event, idx) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {eventIconMap[event.type]}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {event.title}
                        </span>
                        {!event.read && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(event.timestamp, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
