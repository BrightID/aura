import { ArrowDownLeft, ArrowDownRight, ArrowUpRight } from "lucide-react"
import useViewMode from "@/hooks/useViewMode"
import { PreferredView, ProfileTab } from "@/types/dashboard"

export default function ProfileTabs({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: ProfileTab
  setSelectedTab: (value: ProfileTab) => void
}) {
  const { currentViewMode } = useViewMode()
  return (
    <div
      className={`min-h-13 w-full rounded-lg border border-border px-1.5 py-1.5 dark:bg-dark-primary`}
    >
      <div
        className={`flex h-full min-w-full flex-row gap-1.5`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#C9A2FF rgba(209, 213, 219, 0.5)",
        }}
      >
        <button
          onClick={() => setSelectedTab(ProfileTab.OVERVIEW)}
          data-testid="table-view-switch-option-one"
          className={`flex h-[38px] w-full min-w-[100px] cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in-out ${
            selectedTab === ProfileTab.OVERVIEW
              ? "background bg-button-primary font-bold text-white dark:bg-slate-200 dark:text-black"
              : "bg-transparent font-medium text-black dark:text-white"
          }`}
        >
          Overview
        </button>
        {currentViewMode === PreferredView.PLAYER ? (
          <button
            className={`flex h-[38px] w-full min-w-[100px] cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in-out ${
              selectedTab === ProfileTab.CONNECTIONS
                ? "background bg-button-primary font-bold text-white dark:bg-slate-200 dark:text-black"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setSelectedTab(ProfileTab.CONNECTIONS)}
            data-testid="table-view-switch-option-one"
          >
            <ArrowDownRight className="mr-1 h-4 w-4" />
            Connections
          </button>
        ) : (
          <button
            className={`flex min-h-max w-full min-w-[100px] cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in-out ${
              selectedTab === ProfileTab.ACTIVITY ||
              selectedTab === ProfileTab.ACTIVITY_ON_MANAGERS
                ? "background bg-button-primary font-bold text-white dark:bg-slate-200 dark:text-black"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setSelectedTab(ProfileTab.ACTIVITY)}
            data-testid="table-view-switch-option-one"
          >
            <ArrowDownLeft className="mr-1 h-4 w-4" />
            Activity
          </button>
        )}
        <button
          className={`flex w-full min-w-[100px] cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-in-out ${
            selectedTab === ProfileTab.EVALUATIONS
              ? "background bg-button-primary font-bold text-white dark:bg-slate-200 dark:text-black"
              : "bg-transparent font-medium text-black dark:text-white"
          }`}
          onClick={() => setSelectedTab(ProfileTab.EVALUATIONS)}
          data-testid="table-view-switch-option-two"
        >
          <ArrowUpRight className="mr-1 h-4 w-4" />
          Evaluations
        </button>
      </div>
    </div>
  )
}
