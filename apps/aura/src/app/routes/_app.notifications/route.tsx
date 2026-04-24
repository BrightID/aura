import {
  LucideArrowDown,
  LucideArrowUp,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUserCheck,
} from "lucide-react"
import React, { useMemo } from "react"
import { Fragment } from "react/jsx-runtime"
import { Link } from "react-router"
import BrightIdProfilePicture from "@/components/Shared/BrightIdProfilePicture"
import DefaultHeader from "@/components/Header/DefaultHeader"
import {
  getBgClassNameOfAuraRatingObject,
  getTextClassNameOfAuraRatingObject,
} from "@/constants"
import { useBrightIdBackupConnectionResolver } from "@/hooks/useBrightIdBackupWithAuraConnectionData"
import { cn } from "@/lib/utils"
import {
  useNotificationsStore,
  NotificationObject,
  NotificationType,
} from "@/store/notifications.store"
import { useProfileStore } from "@/store/profile.store"
import { BrightIdBackupConnection } from "@/types"
import { EvaluationCategory } from "@/types/dashboard"
import { shortenBrightIdName } from "@/utils/connection"
import { compactFormat } from "@/utils/number"

// Define icons for evaluation categories
export const subjectViewAsIconColored: {
  [key in EvaluationCategory]: string
} = {
  [EvaluationCategory.SUBJECT]: "/assets/images/Shared/brightid-icon.svg",
  [EvaluationCategory.PLAYER]: "/assets/images/Shared/player.svg",
  [EvaluationCategory.TRAINER]: "/assets/images/Shared/trainer.svg",
  [EvaluationCategory.MANAGER]: "/assets/images/Shared/manager-icon-s-blue.svg",
}

const iconMap = {
  level: {
    up: <LucideArrowUp className="text-green-500" />,
    down: <LucideArrowDown className="text-red-500" />,
  },
  score: {
    up: <LucideTrendingUp className="text-green-500" />,
    down: <LucideTrendingDown className="text-red-500" />,
  },
  evaluation: <LucideUserCheck className="text-blue-500" />,
}

export function parseTitleAndDescription(
  description: string,
  type: NotificationType,
  profileId: string,
  resolve: (key: string) => BrightIdBackupConnection,
  brightId: string | undefined,
  to?: string | null,
  newState?: any,
) {
  switch (type) {
    case NotificationType.Evaluation:
      if (to === brightId) {
        return (
          (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
          " Evaluated You"
        )
      }
      return (
        (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
        " Evaluated " +
        (resolve(to!)?.name ?? shortenBrightIdName(to!))
      )
    case NotificationType.LevelIncrease:
      if (profileId === brightId) {
        return "Your Level increased"
      }
      return (
        (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
        " " +
        "Leveled up"
      )
    case NotificationType.LevelDecrease:
      if (profileId === brightId) {
        return "Your Level decreased"
      }
      return (
        (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
        " Level Decreased"
      )
    case NotificationType.ScoreDecrease:
      if (profileId === brightId) {
        return "Your Score dropped to " + compactFormat(newState)
      }
      return (
        (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
        " Score dropped to " +
        compactFormat(newState)
      )
    case NotificationType.ScoreIncrease:
      if (profileId === brightId) {
        return "Your Score increased to " + compactFormat(newState)
      }
      return (
        (resolve(profileId)?.name ?? shortenBrightIdName(profileId)) +
        " Score increased to " +
        compactFormat(newState)
      )
  }

  return ""
}

export default function NotificationsPage() {
  const notifications = useNotificationsStore((s) => s.alerts)
  // const isLoading = useNotificationsStore((s) => s.inboundLoading || s.outboundLoading);
  const authData = useProfileStore((s) => s.authData)
  const { resolve } = useBrightIdBackupConnectionResolver()
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)

  // Define the order of categories for tabs
  const categories: EvaluationCategory[] = [
    EvaluationCategory.SUBJECT,
    EvaluationCategory.PLAYER,
    EvaluationCategory.TRAINER,
    EvaluationCategory.MANAGER,
  ]

  const notificationsByCategory = categories.reduce(
    (acc, category) => {
      const categoryNotifications = notifications.filter(
        (n) => n.category === category,
      )
      acc[category] = [
        ...categoryNotifications.filter((n) => !n.viewed),
        ...categoryNotifications.filter((n) => n.viewed),
      ]
      return acc
    },
    {} as Record<EvaluationCategory, NotificationObject[]>,
  )

  const unreadCounts = categories.reduce(
    (acc, category) => {
      acc[category] = notifications.filter(
        (n) => n.category === category && !n.viewed,
      ).length
      return acc
    },
    {} as Record<EvaluationCategory, number>,
  )

  return (
    <>
      <DefaultHeader title="Notifications" />
      {notifications.length === 0 ? (
        <div data-testid="no-notifications"></div>
      ) : (
        <div data-testid={`notifications-count-${notifications.length}`}></div>
      )}
      <div className="page flex w-full flex-1 flex-col gap-2 pt-4 dark:text-white">
        {/* <a-button
          disabled={isLoading}
          onClick={() =>
            authData?.brightId &&
            triggerNotificationFetch(getState, dispatch, authData.brightId)
          }
          className="ml-auto"
          size="icon"
        >
          <RefreshCcwIcon className={isLoading ? 'animate-spin' : ''} />
        </a-button> */}
        {notifications.filter((item) => !item.viewed).length > 0 && (
          <div className="flex justify-end">
            <a-button size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </a-button>
          </div>
        )}
        <section className="mt-8 flex w-full flex-col gap-4">
          <a-tabs value={categories[0]}>
            {categories.map((category) => (
              <a-tab
                className="relative w-full"
                key={category}
                value={category}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={subjectViewAsIconColored[category]}
                    alt={category}
                    className="h-6 w-6"
                  />
                  {category}
                  {unreadCounts[category] > 0 && (
                    <a-badge className="absolute -right-2 -top-2 ml-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full">
                      {unreadCounts[category]}
                    </a-badge>
                  )}
                </div>
              </a-tab>
            ))}
            {categories.map((category) => (
              <a-tab-panel
                slot="panel"
                className="mt-10"
                key={category}
                value={category}
              >
                {notificationsByCategory[category].length === 0 ? (
                  <a-card className="p-6 text-center">
                    No notifications in this category.
                  </a-card>
                ) : (
                  <>
                    {notificationsByCategory[category].map((n, index) => {
                      const showSeparator =
                        index > 0 &&
                        !n.viewed &&
                        notificationsByCategory[category][index - 1].viewed
                      return (
                        <Fragment key={index}>
                          {showSeparator && (
                            <>
                              <hr className="my-4 border-t border-gray-300" />
                              <div className="mb-2 text-sm font-semibold text-muted-foreground">
                                Read Notifications
                              </div>
                            </>
                          )}
                          <NotificationCard
                            key={index}
                            notification={n}
                            resolve={resolve}
                            brightId={authData?.brightId}
                            markAsRead={markAsRead}
                          />
                        </Fragment>
                      )
                    })}
                  </>
                )}
              </a-tab-panel>
            ))}
          </a-tabs>
        </section>
      </div>
    </>
  )
}

function NotificationCard({
  notification,
  resolve,
  brightId,
  markAsRead,
}: {
  notification: NotificationObject
  resolve: (key: string) => BrightIdBackupConnection
  brightId: string | undefined
  markAsRead: (id: string) => void
}) {
  return (
    <Link to={`/subject/${notification.from}?viewas=${notification.category}`}>
      <a-card
        className={cn(
          "my-2 flex gap-4 rounded-lg p-4",
          !notification.viewed && "bg-muted",
          notification.viewed && "opacity-50",
        )}
      >
        <div className="shrink-0">
          <BrightIdProfilePicture
            className="h-14 w-14 rounded-full"
            subjectId={notification.from}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 font-semibold">
            {parseTitleAndDescription(
              notification.description,
              notification.type,
              notification.from,
              resolve,
              brightId,
              notification.to,
              notification.newState,
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(notification.timestamp).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <div className="mb-5">
            {notification.type === NotificationType.Evaluation &&
            notification.extraPayloads ? (
              <EvaluationInfo
                impact={notification.newState! as number}
                rating={Number(notification.extraPayloads?.rating)}
              />
            ) : [
                NotificationType.LevelDecrease,
                NotificationType.LevelIncrease,
              ].includes(notification.type) ? (
              <LevelInfo
                previousLevel={Number(notification.previousState)}
                newLevel={Number(notification.newState)}
              />
            ) : [
                NotificationType.ScoreDecrease,
                NotificationType.ScoreIncrease,
              ].includes(notification.type) ? (
              <ScoreInfo
                previousScore={Number(notification.previousState)}
                newScore={Number(notification.newState)}
              />
            ) : null}
          </div>
          {!notification.viewed && (
            <div className="">
              <a-button
                size="sm"
                variant="secondary"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                  markAsRead(notification.id)
                }}
              >
                Mark as read
              </a-button>
            </div>
          )}
        </div>
      </a-card>
    </Link>
  )
}

function LevelInfo({
  previousLevel,
  newLevel,
}: {
  previousLevel: number
  newLevel: number
}) {
  const diff = useMemo(
    () => newLevel - previousLevel,
    [previousLevel, newLevel],
  )

  const bgColor = getBgClassNameOfAuraRatingObject({
    rating: (newLevel - previousLevel).toString(),
  })

  return (
    <div
      className={`${bgColor} ml-auto block w-fit rounded-md p-1 text-center text-sm font-semibold`}
    >
      {diff >= 0 ? "+" : ""} {diff}
    </div>
  )
}

function ScoreInfo({
  previousScore,
  newScore,
}: {
  previousScore: number
  newScore: number
}) {
  const diff = newScore - previousScore
  const scoreScaledChange = useMemo(() => {
    const percentChange =
      previousScore !== 0 ? (newScore / previousScore) * 100 : 0
    const scaled = (percentChange / 100) * 4
    return (previousScore < newScore ? 1 : -1) * scaled
  }, [newScore, previousScore])

  const bgColor = getBgClassNameOfAuraRatingObject({
    rating: Math.floor(scoreScaledChange).toString(),
  })

  return (
    <span
      className={`${bgColor} ml-auto block w-fit rounded-md p-1 text-center text-sm font-semibold`}
    >
      {diff >= 0 ? "+" : ""} {compactFormat(diff)}
    </span>
  )
}

function EvaluationInfo({
  rating,
  impact,
}: {
  rating: number
  impact: number
}) {
  const bgColor = useMemo(() => {
    if (rating && Number(rating) !== 0) {
      return getBgClassNameOfAuraRatingObject({ rating: rating.toString() })
    }
    if (rating >= 2) {
      return "bg-pl4"
    }
    if (rating <= 0) {
      return "bg-nl4"
    }
    return "bg-pl1"
  }, [rating])

  return (
    <>
      <div className={`flex flex-col gap-0.5 ${bgColor} rounded-md py-1.5`}>
        <div className="flex items-center justify-center gap-0.5">
          {rating !== 0 && (
            <p
              className={`text-sm font-bold ${getTextClassNameOfAuraRatingObject(
                { rating: rating.toString() },
              )}`}
            >
              {Number(rating) < 0 ? "-" : "+"}
              {Math.abs(Number(rating))}
            </p>
          )}
        </div>
        <p
          className={`impact-percentage ${getTextClassNameOfAuraRatingObject({
            rating: rating.toString(),
          })} w-full text-center text-[11px] font-bold`}
        >
          {impact > 0 ? "+" : "-"} {compactFormat(impact)}
        </p>
      </div>
    </>
  )
}
