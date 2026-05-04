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

        {/* Glassmorphism depth blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-20 dark:opacity-15 blur-3xl bg-primary" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-15 dark:opacity-10 blur-3xl bg-accent" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full opacity-10 dark:opacity-8 blur-3xl bg-primary" />
        </div>

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
