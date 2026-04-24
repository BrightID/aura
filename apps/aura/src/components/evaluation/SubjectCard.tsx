import BrightIdProfilePicture from "@/components/Shared/BrightIdProfilePicture"
import { ConnectionAndEvaluationStatus } from "@/components/Shared/ConnectionAndEvaluationStatus"
import ReactECharts from "echarts-for-react"
import { useSubjectName } from "hooks/useSubjectName"
import useViewMode from "hooks/useViewMode"
import { memo } from "react"
import { Link } from "react-router"
import { getViewModeSubjectBorderColorClass } from "@/constants/index"
import useParseBrightIdVerificationData from "@/hooks/useParseBrightIdVerificationData"
import { Verifications } from "@/types/aura"
import { compactFormat } from "@/utils/number"
import { calculateUserScorePercentage } from "@/utils/score"
import { useImpactEChartOption } from "../../hooks/useSubjectVerifications"
import { HorizontalProgressBar } from "../Shared/HorizontalProgressBar"
import Tooltip from "../Shared/Tooltip"
import { Card } from "../ui/card"

export interface SubjectCardSkeletonProps {
  subjectId: string
  index?: string | number
  verifications?: Verifications
}

export const SubjectCardSkeleton = ({
  subjectId,
  index,
}: SubjectCardSkeletonProps) => {
  return (
    <div data-testid={`subject-card-skeleton-${subjectId}`}>
      <div className="b-4 flex w-full flex-row! items-center justify-between! gap-1 rounded-lg border bg-card p-4">
        <div
          className="evaluation-left flex flex-col gap-2"
          data-testid={`skeleton-item-${index}`}
        >
          <div className="evaluation-left__top flex gap-3">
            <div className="evaluation__profile">
              {/* Profile picture skeleton */}
              <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />
            </div>

            <div className="evaluation__info flex flex-col gap-2">
              {/* Name skeleton */}
              <div className="bg-muted h-4 w-32 animate-pulse rounded-sm" />

              {/* Level and Score skeleton */}
              <div className="flex flex-col gap-1">
                <div className="bg-muted h-4 w-24 animate-pulse rounded-sm" />
                <div className="bg-muted h-4 w-20 animate-pulse rounded-sm" />
              </div>

              {/* Progress bar skeleton */}
              <div className="bg-muted mt-1 h-2.5 w-36 animate-pulse rounded-sm" />
            </div>
          </div>

          {/* Connection status skeleton */}
          <div className="mt-auto">
            <div className="bg-muted h-4 w-40 animate-pulse rounded-sm" />
          </div>
        </div>

        {/* Chart skeleton */}
        <div className="evaluation-right flex flex-col items-end">
          <div className="bg-muted h-12 w-25 animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  )
}
export const SubjectCard = ({
  subjectId,
  index,
  verifications,
}: SubjectCardSkeletonProps) => {
  const name = useSubjectName(subjectId)

  const { currentViewMode, currentEvaluationCategory } = useViewMode()

  const { auraLevel, auraScore, auraImpacts } =
    useParseBrightIdVerificationData(verifications, currentEvaluationCategory)

  const { impactChartSmallOption } = useImpactEChartOption(auraImpacts)

  const progress = calculateUserScorePercentage(
    currentEvaluationCategory,
    auraScore ?? 0,
  )

  return (
    <Link
      to={"/subject/" + subjectId}
      data-testid={`subject-card-${subjectId}`}
    >
      <Card
        data-testid={`subject-card-${subjectId}-${index}`}
        className={`b-4 flex w-full flex-row! items-center justify-between! gap-1 p-4`}
      >
        <div
          className="evaluation-left flex flex-col gap-2"
          data-testid={`user-item-${index}`}
        >
          <div className="evaluation-left__top flex gap-3">
            <div className="evaluation__profile">
              <BrightIdProfilePicture
                className={`h-12 w-12 rounded-full border-2 ${getViewModeSubjectBorderColorClass(
                  currentViewMode,
                )} bg-cover bg-center`}
                subjectId={subjectId}
              />
            </div>
            <div className="evaluation__info flex flex-col">
              <p
                className="text-foreground font-medium"
                data-testid={`subject-item-${index}-name`}
              >
                {name}
              </p>

              <div className="text-muted-foreground">
                Level:{" "}
                <span
                  data-testid={`subject-item-${index}-level`}
                  className="text-foreground font-medium"
                >
                  {auraLevel}
                </span>
                <span className="mt-2 text-sm">
                  <p className="text-muted-foreground">
                    Score:{" "}
                    <span
                      data-testid={`subject-item-${index}-score`}
                      className="text-foreground font-medium"
                    >
                      {auraScore ? compactFormat(auraScore) : "-"}
                    </span>
                  </p>
                </span>
              </div>
              {progress < 0 ? (
                "😈"
              ) : (
                <HorizontalProgressBar
                  data-testid={`subject-${subjectId}-score-progress-${progress}`}
                  className="w-36"
                  percentage={progress}
                />
              )}
            </div>
          </div>

          <div className="mt-auto">
            <ConnectionAndEvaluationStatus
              auraImpacts={auraImpacts ?? []}
              subjectId={subjectId}
            />
          </div>
        </div>
        <div className="evaluation-right flex flex-col items-end gap-2">
          <Tooltip
            tooltipClassName="text-sm translate-x-1/2"
            position="top-left"
            content={"Top evaluations of " + name}
            className="evaluation-right__bottom"
          >
            <ReactECharts
              data-testid={`subject-item-${index}-chart`}
              opts={{
                height: 48,
                width: "auto",
              }}
              style={{ height: "48px", width: "100%" }}
              option={impactChartSmallOption}
            />
          </Tooltip>
        </div>
      </Card>
    </Link>
  )
}

export const SubjectCardMemo = memo(SubjectCard)

SubjectCardMemo.displayName = "SubjectCard"
