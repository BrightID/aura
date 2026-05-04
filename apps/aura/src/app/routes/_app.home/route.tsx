import { SubjectCardMemo } from "components/evaluation/SubjectCard"
import { SubjectListControls } from "components/evaluation/SubjectListControls"
import useViewMode from "hooks/useViewMode"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { EmptySubjectList } from "@/components/Shared/EmptyAndLoadingStates/EmptySubjectList"
import { LoadingList } from "@/components/Shared/EmptyAndLoadingStates/LoadingList"
import InfiniteScrollLocal from "@/components/Shared/InfiniteScrollLocal"
import LevelUp from "@/components/Shared/LevelUp"
import { useSubjectsList } from "@/hooks/use-subjects-list"
import { useMyEvaluationsContext } from "@/hooks/useMyEvaluationsContext"
import { useSubjectInboundEvaluationsSetup } from "@/hooks/useSubjectInboundEvaluationsContext"
import { useProfileStore } from "@/store/profile.store"
import { useLevelupProgress } from "@/utils/score"
import HomeHeader from "./components/header"
import ProfileHeaderCard from "./components/ProfileHeaderCard"
import ProfileInfoPerformance from "./components/ProfileInfoPerformance"

const Home = () => {
  const color = {
    Player: "pastel-green",
    Trainer: "pastel-orange",
    Manager: "pastel-blue",
  }
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const isEvaluate =
    searchParams.get("tab") === "evaluate" || !searchParams.get("tab") // default to evaluate if no tab

  const authData = useProfileStore((s) => s.authData)
  const authKey = useProfileStore((s) => s.authKey)
  const getBrightIdBackup = useProfileStore((s) => s.getBrightIdBackup)
  const { currentRoleEvaluatorEvaluationCategory } = useViewMode()

  const {
    itemsFiltered: filteredSubjects,
    selectedFilterIds,
    clearSortAndFilter,
  } = useSubjectsList()

  const [loading, setLoading] = useState(false)
  const refreshBrightIdBackup = useCallback(async () => {
    if (!authKey) return
    setLoading(true)
    await getBrightIdBackup(authKey)
    setLoading(false)
  }, [authKey, getBrightIdBackup])

  const { loading: loadingMyEvaluations } = useMyEvaluationsContext()

  const setTab = (tab: "evaluate" | "levelup") => {
    setSearchParams({ tab })
  }

  const { isUnlocked, reason } = useLevelupProgress({
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  })

  useEffect(() => {
    if (!authData?.brightId) navigate("/")
  }, [authData, navigate])

  useSubjectInboundEvaluationsSetup(authData?.brightId)

  if (!authData?.brightId) {
    return <div>Not logged in</div>
  }

  return loadingMyEvaluations ? (
    <LoadingList />
  ) : (
    <>
      <ProfileHeaderCard subjectId={authData.brightId} />
      <div className="my-5"></div>
      <ProfileInfoPerformance
        subjectId={authData.brightId}
        isPerformance={true}
        color={color.Player}
      />
      <a-tabs
        value={isEvaluate ? "evaluate" : "levelup"}
        onChange={(e) => {
          const newValue = e.target?.value

          setTab(newValue as "evaluate" | "levelup")
        }}
        className="w-full mt-4"
      >
        <a-tab className="h-10" value="evaluate">
          Evaluate
        </a-tab>
        <a-tab className="h-10" disabled={!isUnlocked} value="levelup">
          Level Up
        </a-tab>

        <a-tab-panel slot="panel" value="evaluate">
          <div className="mt-4">
            <SubjectListControls
              loading={loading}
              refreshBrightIdBackup={refreshBrightIdBackup}
            />
            {filteredSubjects && !loading ? (
              filteredSubjects.length > 0 ? (
                <InfiniteScrollLocal
                  getScrollParent={() =>
                    document.getElementById("scrollable-div")
                  }
                  className={"flex grow flex-col gap-3"}
                  items={filteredSubjects}
                  renderItem={(conn, index) => (
                    <SubjectCardMemo
                      verifications={conn.verifications}
                      key={conn.id}
                      index={index}
                      subjectId={conn.id}
                    />
                  )}
                />
              ) : (
                <EmptySubjectList
                  clearSortAndFilter={clearSortAndFilter}
                  hasFilter={selectedFilterIds !== null}
                  showConnectionGuide={true}
                />
              )
            ) : (
              <LoadingList />
            )}
          </div>
        </a-tab-panel>

        <a-tab-panel slot="panel" value="levelup">
          <LevelUp subjectId={authData.brightId} />
        </a-tab-panel>
      </a-tabs>
    </>
  )
}

const HomePage = () => {
  return (
    <>
      <HomeHeader />
      <Home />
    </>
  )
}

export default HomePage
