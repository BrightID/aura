import { SubjectCardMemo } from "components/EvaluationFlow/SubjectCard"
import { SubjectListControls } from "components/EvaluationFlow/SubjectListControls"
import { useMyEvaluationsContext } from "contexts/MyEvaluationsContext"
import { SubjectInboundEvaluationsContextProvider } from "contexts/SubjectInboundEvaluationsContext"
import useViewMode from "hooks/useViewMode"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { RoutePath } from "types/router"
import InfiniteScrollLocal from "@/components/InfiniteScrollLocal"
import LevelUp from "@/components/LevelUp"
import { EmptySubjectList } from "@/components/Shared/EmptyAndLoadingStates/EmptySubjectList"
import { LoadingList } from "@/components/Shared/EmptyAndLoadingStates/LoadingList"
import { useSubjectsListContext } from "@/contexts/SubjectsListContext"
import { useProfileStore } from "@/store/profile.store"
import { hash } from "@/utils/crypto"
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
  const [isEvaluate, setIsEvaluate] = useState(true)
  const [query] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    if (query.get("tab") === "evaluate") {
      setIsEvaluate(true)
    }

    if (query.get("tab") === "levelup") {
      setIsEvaluate(false)
    }
  }, [query, navigate])

  const authData = useProfileStore((s) => s.authData)
  const getBrightIdBackup = useProfileStore((s) => s.getBrightIdBackup)
  const { currentRoleEvaluatorEvaluationCategory } = useViewMode()

  const {
    itemsFiltered: filteredSubjects,
    selectedFilterIds,
    clearSortAndFilter,
  } = useSubjectsListContext()

  const [loading, setLoading] = useState(false)
  const refreshBrightIdBackup = useCallback(async () => {
    if (!authData) return
    setLoading(true)
    const authKey = hash(authData.brightId + authData.password)
    await getBrightIdBackup(authKey)
    setLoading(false)
  }, [authData, getBrightIdBackup])

  const { loading: loadingMyEvaluations } = useMyEvaluationsContext()

  const { isUnlocked, reason } = useLevelupProgress({
    evaluationCategory: currentRoleEvaluatorEvaluationCategory,
  })

  useEffect(() => {
    if (!authData?.brightId) navigate("/")
  }, [authData, navigate])

  if (!authData?.brightId) {
    return <div>Not logged in</div>
  }

  return loadingMyEvaluations ? (
    <LoadingList />
  ) : (
    <SubjectInboundEvaluationsContextProvider subjectId={authData.brightId}>
      <a-scroll-area
        id="scrollable-div"
        className="page *:overflow-x-visible h-screen *:flex *:flex-col gap-4"
      >
        <ProfileHeaderCard subjectId={authData.brightId} />
        <ProfileInfoPerformance
          subjectId={authData.brightId}
          isPerformance={true}
          color={color.Player}
        />

        {/* <ToggleInput
          tooltipFirstTab="Find users to rate"
          tooltipSecondTab="Advance your score"
          option1={'Evaluate'}
          option2={'Level Up'}
          isChecked={isEvaluate}
          disabledHelpText={reason}
          setIsChecked={(isEvaluate) => {
            navigate(
              RoutePath.HOME + `?tab=${isEvaluate ? 'evaluate' : 'levelup'}`,
            );
          }}
          option2Disabled={!isUnlocked}
        /> */}
        <a-tabs
          value={isEvaluate ? "evaluate" : "levelup"}
          onChange={(e) => {
            const newValue = e.target?.value

            navigate(RoutePath.HOME + `?tab=${newValue}`)
          }}
          className="w-full"
        >
          <a-tab value="evaluate">Evaluate</a-tab>
          <a-tab disabled={!isUnlocked} value="levelup">
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
                  <div className="no-scrollbar grow overflow-auto">
                    <InfiniteScrollLocal
                      getScrollParent={() =>
                        document.getElementById("scrollable-div")
                      }
                      className={"flex flex-col gap-3"}
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
                  </div>
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
      </a-scroll-area>
    </SubjectInboundEvaluationsContextProvider>
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
