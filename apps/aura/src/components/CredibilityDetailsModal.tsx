import { useMyEvaluationsContext } from "contexts/MyEvaluationsContext"
import { useInboundEvaluations } from "hooks/useSubjectEvaluations"
import { useSubjectName } from "hooks/useSubjectName"
import {
  useImpactPercentage,
  useSubjectVerifications,
} from "hooks/useSubjectVerifications"
import { PencilIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { useSelector } from "store/hooks"
import { selectAuthData } from "store/profile/selectors"
import { EvaluationCategory } from "types/dashboard"
import { SubjectInboundEvaluationsContextProvider } from "@/contexts/SubjectInboundEvaluationsContext"
import { compactFormat } from "@/utils/number"
import { calculateUserScorePercentage } from "@/utils/score"

import {
  getRawTextClassNameOfAuraRatingNumber,
  getViewModeSubjectTextColorClass,
  viewAsToViewMode,
} from "../constants"
import { CredibilityDetailsProps } from "../types"
import BrightIdProfilePicture from "./BrightIdProfilePicture"
import EvaluationFlow from "./EvaluationFlow/EvaluationFlow"
import { HorizontalProgressBar } from "./Shared/HorizontalProgressBar"
import { EvaluationsChart } from "./Shared/ProfileOverview/evaluations-chart"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Skeleton } from "./ui/skeleton"

const views = [
  EvaluationCategory.SUBJECT,
  EvaluationCategory.PLAYER,
  EvaluationCategory.TRAINER,
  EvaluationCategory.MANAGER,
]

const CredibilityDetailsForRole = ({
  subjectId,
  roleEvaluationCategory,
  onClose,
}: {
  subjectId: string
  roleEvaluationCategory: EvaluationCategory
  onClose: () => void
}) => {
  const authData = useSelector(selectAuthData)
  const { auraLevel, auraScore, auraImpacts, refresh } =
    useSubjectVerifications(subjectId, roleEvaluationCategory)
  const [showEvaluationFlow, setShowEvaluationFlow] = useState(false)
  const { ratings, inboundRatingsStatsString } = useInboundEvaluations({
    subjectId,
    evaluationCategory: roleEvaluationCategory,
  })
  const impactPercentage = useImpactPercentage(auraImpacts, authData?.brightId)

  const { loading, myRatingToSubject, myConfidenceValueInThisSubjectRating } =
    useMyEvaluationsContext({
      subjectId,
      evaluationCategory: roleEvaluationCategory,
    })
  const auraImpactsSorted = useMemo(
    () =>
      (auraImpacts ?? [])
        .filter((item) => item.impact !== 0)
        .sort((a, b) => a.impact - b.impact),
    [auraImpacts],
  )
  const link = "/subject/" + subjectId
  const navigate = useNavigate()

  const progress = calculateUserScorePercentage(
    roleEvaluationCategory,
    auraScore ?? 0,
  )

  return (
    <>
      <div className="text-l font-bold">
        As a{" "}
        <span
          className={getViewModeSubjectTextColorClass(
            viewAsToViewMode[roleEvaluationCategory],
          )}
        >
          {roleEvaluationCategory.slice(0, 1).toUpperCase() +
            roleEvaluationCategory.slice(1)}
        </span>
        :
      </div>
      <div>
        Level: <span className="font-bold">{auraLevel}</span>
      </div>
      <div className="flex w-full items-center gap-2">
        <div>
          Score:{" "}
          <span className="font-medium">
            {auraScore ? compactFormat(auraScore) : "-"}
          </span>
        </div>
        <HorizontalProgressBar percentage={progress} />
      </div>
      <div>
        Evaluations:{" "}
        <span className="font-bold">
          {ratings !== null ? ratings.length : "..."} (
          {inboundRatingsStatsString})
        </span>
      </div>
      <div>
        Your Evaluation:{" "}
        <span className="font-bold">
          {loading ? (
            <span className="text-gray20">...</span>
          ) : myRatingToSubject && Number(myRatingToSubject.rating) > 0 ? (
            <span
              className={`${getRawTextClassNameOfAuraRatingNumber(
                Number(myRatingToSubject.rating),
              )}`}
            >
              Positive - {myConfidenceValueInThisSubjectRating} (
              {(Number(myRatingToSubject.rating) > 0 ? "+" : "") +
                Number(myRatingToSubject.rating)}
              )
            </span>
          ) : myRatingToSubject && Number(myRatingToSubject.rating) < 0 ? (
            <span
              className={`${getRawTextClassNameOfAuraRatingNumber(
                Number(myRatingToSubject.rating),
              )}`}
            >
              Negative - {myConfidenceValueInThisSubjectRating} (
              {Number(myRatingToSubject.rating)})
            </span>
          ) : (
            "-"
          )}
        </span>
      </div>
      <SubjectInboundEvaluationsContextProvider subjectId={subjectId}>
        <EvaluationFlow
          refresh={refresh}
          evaluationCategory={roleEvaluationCategory}
          currentViewMode={viewAsToViewMode[roleEvaluationCategory]}
          showEvaluationFlow={showEvaluationFlow}
          setShowEvaluationFlow={setShowEvaluationFlow}
          subjectId={subjectId}
        />
      </SubjectInboundEvaluationsContextProvider>
      <div>
        Your Evaluation Impact:{" "}
        {loading ? (
          <span className="text-gray20">...</span>
        ) : myRatingToSubject && Number(myRatingToSubject.rating) !== 0 ? (
          <div className="inline-flex items-center gap-3">
            <span
              className={`font-bold`}
              style={{
                color: "#6C34B3",
              }}
            >
              {(Number(myRatingToSubject.rating) > 0 ? 1 : -1) *
                (impactPercentage ?? 0)}
              %
            </span>

            <a-button
              onClick={() => setShowEvaluationFlow(true)}
              variant="secondary"
              size="icon"
            >
              <PencilIcon width={10} height={10} />
            </a-button>
          </div>
        ) : (
          <span>
            none.{" "}
            <button
              disabled={subjectId === authData?.brightId}
              onClick={() => setShowEvaluationFlow(true)}
              className="text-sm text-pastel-blue disabled:opacity-50"
            >
              Evaluate Now
            </button>
          </span>
        )}
      </div>
      <EvaluationsChart
        evaluationCategory={roleEvaluationCategory}
        loading={loading}
        impacts={auraImpactsSorted}
        onBarClick={(entry: any) => {
          onClose()
          navigate(
            `/subject/${entry.evaluated}?viewas=${roleEvaluationCategory}`,
          )
        }}
      />
      <Link
        to={link + "?viewas=" + roleEvaluationCategory}
        className="btn mt-auto flex w-full justify-center"
        onClick={(e) => {
          e.preventDefault()
          onClose()
          navigate(link + "?viewas=" + roleEvaluationCategory)
        }}
      >
        View{" "}
        {String(roleEvaluationCategory)[0].toUpperCase() +
          String(roleEvaluationCategory).slice(1)}{" "}
        Profile
      </Link>
    </>
  )
}

const CredibilityDetails = ({
  credibilityDetailsProps,
  onClose,
}: {
  credibilityDetailsProps: CredibilityDetailsProps
  onClose: () => void
}) => {
  const [evaluationCategory, setEvaluationCategory] = useState(
    credibilityDetailsProps.evaluationCategory,
  )

  const playerEvaluation = useSubjectVerifications(
    credibilityDetailsProps.subjectId,
    EvaluationCategory.PLAYER,
  )

  const trainerEvaluation = useSubjectVerifications(
    credibilityDetailsProps.subjectId,
    EvaluationCategory.TRAINER,
  )

  const managerEvaluation = useSubjectVerifications(
    credibilityDetailsProps.subjectId,
    EvaluationCategory.MANAGER,
  )

  const authorizedTabs = useMemo(() => {
    const tabs = [EvaluationCategory.SUBJECT]

    if (playerEvaluation.auraLevel && playerEvaluation.auraLevel > 0)
      tabs.push(EvaluationCategory.PLAYER)

    if (trainerEvaluation.auraLevel && trainerEvaluation.auraLevel > 0)
      tabs.push(EvaluationCategory.TRAINER)

    if (managerEvaluation.auraLevel && managerEvaluation.auraLevel > 0)
      tabs.push(EvaluationCategory.MANAGER)

    return tabs
  }, [playerEvaluation, trainerEvaluation, managerEvaluation])

  const isLoading =
    managerEvaluation.loading ||
    trainerEvaluation.loading ||
    playerEvaluation.loading

  useEffect(() => {
    if (isLoading) return

    if (!authorizedTabs.includes(evaluationCategory)) {
      setEvaluationCategory(authorizedTabs[0])
    }
  }, [isLoading, authorizedTabs, evaluationCategory])

  if (isLoading)
    return (
      <div className="flex min-h-[450px] w-full flex-col">
        <div
          className={`mb-5 min-h-[52px] w-full rounded-lg p-1 px-1.5 py-1.5`}
        >
          <div
            className={`flex h-full min-w-full flex-row gap-2 overflow-x-auto overflow-y-hidden pb-1`}
            // TODO: refactor this to tailwindcss class and values
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#292534 rgba(209, 213, 219, 0.5)",
            }}
          >
            {views.map((_, key) => (
              <Skeleton
                key={key}
                className={`flex h-9 w-full min-w-[100px] animate-pulse cursor-pointer items-center justify-center rounded-md`}
              ></Skeleton>
            ))}
          </div>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-[450px] w-full flex-col">
      <div
        className={`mb-5 min-h-[52px] w-full rounded-lg bg-white-90-card p-1 px-1.5 py-1.5 dark:bg-dark-primary`}
      >
        <div
          className={`flex h-full min-w-full overflow-x-auto overflow-y-hidden pb-1 md:flex-nowrap`}
          // TODO: refactor this to tailwindcss class and values
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#292534 rgba(209, 213, 219, 0.5)",
          }}
        >
          <p
            className={`rounded-md ${
              authorizedTabs.length > 0 ? "" : "hidden"
            } flex h-9 w-full min-w-[100px] cursor-pointer items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
              evaluationCategory === EvaluationCategory.SUBJECT
                ? "background bg-orange font-bold text-white dark:text-black"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setEvaluationCategory(EvaluationCategory.SUBJECT)}
            data-testid="table-view-switch-option-one"
          >
            <img
              src={
                evaluationCategory === EvaluationCategory.SUBJECT
                  ? "/assets/images/Shared/brightid-icon-white.svg"
                  : "/assets/images/Shared/brightid-icon.svg"
              }
              alt=""
            />
            Subject
          </p>
          <p
            className={`rounded-md ${
              authorizedTabs.length > 1 ? "" : "hidden"
            } flex h-9 w-full min-w-[100px] cursor-pointer items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
              evaluationCategory === EvaluationCategory.PLAYER
                ? "background bg-purple font-bold text-white"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setEvaluationCategory(EvaluationCategory.PLAYER)}
            data-testid="table-view-switch-option-one"
          >
            <img src="/assets/images/player.svg" alt="" />
            Player
          </p>
          <p
            className={`rounded-md ${
              authorizedTabs.length > 2 ? "" : "hidden"
            } flex h-9 w-full min-w-[100px] cursor-pointer items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
              evaluationCategory === EvaluationCategory.TRAINER
                ? "background bg-green font-bold text-white"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setEvaluationCategory(EvaluationCategory.TRAINER)}
            data-testid="table-view-switch-option-two"
          >
            <img src="/assets/images/Shared/trainer.svg" alt="" width={20} />
            Trainer
          </p>
          <p
            className={`rounded-md ${
              authorizedTabs.length > 3 ? "" : "hidden"
            } flex h-9 w-full min-w-[100px] cursor-pointer items-center justify-center gap-1 transition-all duration-300 ease-in-out ${
              evaluationCategory === EvaluationCategory.MANAGER
                ? "background bg-blue font-bold text-white"
                : "bg-transparent font-medium text-black dark:text-white"
            }`}
            onClick={() => setEvaluationCategory(EvaluationCategory.MANAGER)}
            data-testid="table-view-switch-option-two"
          >
            <img
              src="/assets/images/Shared/manager-icon-s-blue.svg"
              alt=""
              width={20}
            />
            Manager
          </p>
        </div>
      </div>
      <CredibilityDetailsForRole
        roleEvaluationCategory={evaluationCategory}
        subjectId={credibilityDetailsProps.subjectId}
        onClose={onClose}
      />
    </div>
  )
}
const CredibilityDetailsModal = ({
  credibilityDetailsProps,
  onClose,
}: {
  credibilityDetailsProps: CredibilityDetailsProps
  onClose: () => void
}) => {
  const name = useSubjectName(credibilityDetailsProps.subjectId)
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent aria-describedby={`${name} subject credebility details`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrightIdProfilePicture
              className={`h-10 w-10 rounded-full border-2 border-stone-400 bg-cover bg-center`}
              subjectId={credibilityDetailsProps.subjectId}
            />
            {name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-5">
          <CredibilityDetails
            credibilityDetailsProps={credibilityDetailsProps}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CredibilityDetailsModal
