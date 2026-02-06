import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getAuth } from "firebase/auth"
import _ from "lodash"
import { Check, Info, Settings, Shield } from "lucide-react"
import { useState } from "react"
import { AlertDialogHeader } from "~/components/ui/alert-dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Progress } from "~/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Separator } from "~/components/ui/separator"
import { API_BASE_URL } from "~/constants"
import { plans } from "~/constants/subscriptions"
import { cn } from "~/lib/utils"
import type { Project } from "~/types/projects"
import { formatScore } from "~/utils/numbers"

export default function ProjectUsage({ project }: { project: Project }) {
  const sub = plans.find((item) => project.selectedPlanId === item.id)!

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
          <CardDescription>
            Monitor your token consumption and remaining allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Remaining Tokens
              </span>
              <span className="text-sm font-medium">
                {project.remainingtokens.toLocaleString()} /{" "}
                {sub.tokens.toLocaleString()}
              </span>
            </div>
            <Progress
              value={Math.min(
                (project.remainingtokens / sub.tokens) * 100,
                100
              )}
              className="h-3"
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">
                {project.remainingtokens.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Remaining</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">
                {(sub.tokens - project.remainingtokens).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Used</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-semibold">
                {((project.remainingtokens / sub.tokens) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function UserRequiredLevelCard({ project }: { project: Project }) {
  const [selectedLevel, setSelectedLevel] = useState<string>(
    project.requirementLevel?.toString() ?? ""
  )

  const queryClient = useQueryClient()

  const { isPending, mutate } = useMutation({
    mutationKey: ["update-project", project.id],
    mutationFn: async (level: number) => {
      const token = await getAuth().currentUser?.getIdToken()
      return axios.post(
        `${API_BASE_URL}/api/projects/update-project`,
        { ...project, requirementLevel: level },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects"] })
    },
  })

  const handleSave = () => {
    if (selectedLevel === "") return
    mutate(Number(selectedLevel))
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Verification Requirement Level</CardTitle>
              <CardDescription>
                Minimum level users must achieve to pass
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                isPending ||
                selectedLevel === project.requirementLevel?.toString()
              }
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-3">
          <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel}>
            {[4, 3, 2, 1, 0].map((level) => {
              const isSelected = selectedLevel === level.toString()
              const isCurrent = project.requirementLevel === level

              return (
                <label
                  key={level}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 cursor-pointer bg-muted/30 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/40",
                    isCurrent && "border-green-500 bg-green-500/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={level.toString()} />

                    <div className="select-none space-y-1">
                      <p className="font-semibold text-lg">
                        Level {level} • {formatScore(subjectLevelPoints[level])}{" "}
                        Score
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {levelRequirements[level]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/15 text-green-700"
                      >
                        Current
                      </Badge>
                    )}
                    {isSelected && !isCurrent && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

const levelRequirements: Record<number, string> = {
  1: "1 low+ confidence eval from 1 level 1+ evaluator",
  2: "1 medium+ confidence eval from 1 level 1+ evaluator",
  3: "1 high+ confidence eval from 1 level 2+ evaluator OR 2 medium confidence evals from 2 level 2+ evaluators",
  4: "1 high+ confidence eval from 1 level 3+ evaluator OR 2 medium confidence evals from 2 level 3+ evaluators",
  0: "No minimum evaluation requirements",
}

const subjectLevelPoints = [0, 1000000, 5000000, 10000000, 150000000]
