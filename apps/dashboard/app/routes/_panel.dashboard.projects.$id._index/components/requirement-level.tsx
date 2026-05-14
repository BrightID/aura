import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getAuth } from "firebase/auth"
import { Check, Shield } from "lucide-react"
import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { API_BASE_URL } from "~/constants"
import { cn } from "~/lib/utils"
import type { Project } from "~/types/projects"
import { formatScore } from "~/utils/numbers"

const levelPalette: Record<number, { selected: string; current: string; text: string; dot: string; badge: string; radio: string }> = {
  0: {
    selected: "border-zinc-400 bg-zinc-500/10",
    current:  "border-zinc-400/60 bg-zinc-500/5",
    text:     "text-zinc-400",
    dot:      "bg-zinc-400",
    badge:    "bg-zinc-500/15 text-zinc-400",
    radio:    "border-zinc-400 text-zinc-400",
  },
  1: {
    selected: "border-amber-500 bg-amber-500/10",
    current:  "border-amber-500/60 bg-amber-500/5",
    text:     "text-amber-500",
    dot:      "bg-amber-500",
    badge:    "bg-amber-500/15 text-amber-600",
    radio:    "border-amber-500 text-amber-500",
  },
  2: {
    selected: "border-sky-500 bg-sky-500/10",
    current:  "border-sky-500/60 bg-sky-500/5",
    text:     "text-sky-500",
    dot:      "bg-sky-500",
    badge:    "bg-sky-500/15 text-sky-600",
    radio:    "border-sky-500 text-sky-500",
  },
  3: {
    selected: "border-emerald-500 bg-emerald-500/10",
    current:  "border-emerald-500/60 bg-emerald-500/5",
    text:     "text-emerald-500",
    dot:      "bg-emerald-500",
    badge:    "bg-emerald-500/15 text-emerald-600",
    radio:    "border-emerald-500 text-emerald-500",
  },
  4: {
    selected: "border-violet-500 bg-violet-500/10",
    current:  "border-violet-500/60 bg-violet-500/5",
    text:     "text-violet-500",
    dot:      "bg-violet-500",
    badge:    "bg-violet-500/15 text-violet-600",
    radio:    "border-violet-500 text-violet-500",
  },
}

const levelRequirements: Record<number, string> = {
  0: "No minimum evaluation requirements",
  1: "1 low+ confidence eval from 1 level 1+ evaluator",
  2: "1 medium+ confidence eval from 1 level 1+ evaluator",
  3: "1 high+ confidence eval from 1 level 2+ evaluator OR 2 medium confidence evals from 2 level 2+ evaluators",
  4: "1 high+ confidence eval from 1 level 3+ evaluator OR 2 medium confidence evals from 2 level 3+ evaluators",
}

const levelPoints = [0, 1_000_000, 5_000_000, 10_000_000, 150_000_000]

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
        { headers: { Authorization: `Bearer ${token}` } }
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
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || selectedLevel === project.requirementLevel?.toString()}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel} className="space-y-3">
          {[4, 3, 2, 1, 0].map((level) => {
            const isSelected = selectedLevel === level.toString()
            const isCurrent = project.requirementLevel === level
            const palette = levelPalette[level]

            return (
              <label
                key={level}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all",
                  isSelected
                    ? cn(palette.selected, "shadow-sm")
                    : isCurrent
                      ? palette.current
                      : "border-border bg-muted/30 hover:bg-muted/60"
                )}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem
                    value={level.toString()}
                    className={isSelected ? palette.radio : ""}
                  />
                  <div className="select-none space-y-1">
                    <p className={cn("font-semibold text-lg flex items-center gap-2", isSelected && palette.text)}>
                      <span className={cn("inline-block w-2 h-2 rounded-full", palette.dot)} />
                      Level {level} • {formatScore(levelPoints[level])} Score
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {levelRequirements[level]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <Badge variant="secondary" className={palette.badge}>
                      Current
                    </Badge>
                  )}
                  {isSelected && !isCurrent && (
                    <Check className={cn("w-5 h-5", palette.text)} />
                  )}
                </div>
              </label>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
