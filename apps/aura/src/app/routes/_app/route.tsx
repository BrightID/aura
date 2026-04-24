import { Outlet } from "react-router"
import NotificationsChecker from "@/components/notifications/notifications-checker"
import EvaluationOpNotifications from "@/components/Shared/EvaluationOpNotifications"
import { IS_PRODUCTION } from "@/utils/env"

export default function AppLanding() {
  return (
    <div className="bg-background-light dark:bg-background">
      <div
        className={`${IS_PRODUCTION ? "bg-circle-dots" : "bg-lines"} relative`}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

        <a-scroll-area className="max-w-lg h-screen mx-auto relative">
          <Outlet />

          <div className="sticky bottom-2 pl-5 pr-5">
            <EvaluationOpNotifications />
          </div>
        </a-scroll-area>
      </div>
      <NotificationsChecker />
    </div>
  )
}
