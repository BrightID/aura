import { CreditCard } from "lucide-react"
import { format } from "date-fns"
import { plans } from "~/constants/subscriptions"
import { Link } from "react-router"
import type { Project } from "~/types/projects"

export default function ProjectBilling({ project }: { project: Project }) {
  const sub = plans.find((item) => project.selectedPlanId === item.id)!

  return (
    <div className="space-y-6">
      <a-card variant="default">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold leading-none">Current Plan</h3>
          <p className="text-sm text-muted-foreground">
            Your subscription and billing details
          </p>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {sub ? `Plan #${sub.name}` : "No Plan Selected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {project.selectedPlanId
                    ? "Active subscription"
                    : "Select a plan to get started"}
                </p>
              </div>
            </div>
            <Link to={`/dashboard/projects/${project.id}/upgrade`}>
              <a-button>Upgrade</a-button>
            </Link>
          </div>
        </div>
      </a-card>

      <a-card variant="default">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold leading-none">Token Allocation</h3>
          <p className="text-sm text-muted-foreground">
            Token balance and usage for billing period
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Remaining Tokens</p>
              <p className="text-2xl font-semibold mt-1">
                {project.remainingtokens.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Billing Cycle End</p>
              <p className="text-2xl font-semibold mt-1">
                {project.deadline
                  ? format(new Date(project.deadline), "MMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  )
}
