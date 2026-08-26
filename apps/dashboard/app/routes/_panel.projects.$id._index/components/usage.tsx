import { plans } from "~/constants/subscriptions"
import type { Project } from "~/types/projects"

export default function ProjectUsage({ project }: { project: Project }) {
  const sub = plans.find((item) => project.selectedPlanId === item.id)!

  return (
    <div className="space-y-6">
      <a-card>
        <div className="flex flex-col gap-1.5 p-6">
          <a-head level="3" className="text-lg font-semibold">
            Token Usage
          </a-head>
          <p className="text-muted-foreground text-sm">
            Monitor your token consumption and remaining allocation
          </p>
        </div>
        <div className="space-y-6 p-6 pt-0">
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
            <a-progress
              value={Math.min(
                (project.remainingtokens / sub.tokens) * 100,
                100
              )}
              className="h-3"
            />
          </div>

          <a-separator />

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
        </div>
      </a-card>
    </div>
  )
}

