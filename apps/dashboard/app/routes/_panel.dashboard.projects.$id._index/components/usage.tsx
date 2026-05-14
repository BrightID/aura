import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Separator } from "~/components/ui/separator"
import { plans } from "~/constants/subscriptions"
import type { Project } from "~/types/projects"

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

