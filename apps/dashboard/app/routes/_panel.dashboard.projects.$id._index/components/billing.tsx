import { CreditCard } from "lucide-react"
import { format } from "date-fns"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { plans } from "~/constants/subscriptions"
import { Link } from "react-router"
import type { Project } from "~/types/projects"

export default function ProjectBilling({ project }: { project: Project }) {
  const sub = plans.find((item) => project.selectedPlanId === item.id)!

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button asChild>
              <Link to={`/dashboard/projects/${project.id}/upgrade`}>
                Upgrade
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Allocation</CardTitle>
          <CardDescription>
            Token balance and usage for billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
