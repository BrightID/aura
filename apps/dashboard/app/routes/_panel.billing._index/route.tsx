import { useQuery } from "@tanstack/react-query"
import { getAuth } from "firebase/auth"
import { format } from "date-fns"
import { Link } from "react-router"
import {
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  Receipt,
  XCircle,
  ArrowRight,
  Zap,
  Crown,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { API_BASE_URL } from "~/constants"
import { getUserProjects } from "~/utils/apis"
import { plans } from "~/constants/subscriptions"

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentStatus =
  | "pending"
  | "waitingPayment"
  | "waitingAuthorization"
  | "inProgress"
  | "completed"
  | "failed"

interface Payment {
  id: number
  orderId: string
  projectId: number
  projectName: string | null
  planId: number
  isYearly: boolean | null
  amount: number
  status: PaymentStatus | null
  createdAt: string | null
  updatedAt: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchPaymentHistory(): Promise<Payment[]> {
  const token = await getAuth().currentUser?.getIdToken()
  const res = await fetch(`${API_BASE_URL}/api/payments/history`, {
    headers: { authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch payment history")
  const json = await res.json()
  return json.payments as Payment[]
}

function getPlanById(id: number | null) {
  return plans.find((p) => p.id === id) ?? plans[0]
}

function PlanIcon({ planId }: { planId: number | null }) {
  const plan = getPlanById(planId)
  const Icon = plan.icon
  return <Icon className="h-4 w-4" />
}

function StatusBadge({ status }: { status: PaymentStatus | null }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500/15 text-green-600 border-green-500/30 gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      )
    case "pending":
    case "waitingPayment":
    case "waitingAuthorization":
    case "inProgress":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1">
          <Clock className="h-3 w-3" />
          Processing
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary">{status ?? "Unknown"}</Badge>
      )
  }
}

// ─── Section A — Current Subscription ────────────────────────────────────────

function CurrentSubscriptionSection() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Current Subscriptions</CardTitle>
          </div>
          <CardDescription>Your active plans across all projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const projectList = projects ?? []
  const paidProjects = projectList.filter((p) => p.selectedPlanId != null)
  const freeProjects = projectList.filter((p) => p.selectedPlanId == null)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Current Subscriptions</CardTitle>
        </div>
        <CardDescription>Your active plans across all projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paidProjects.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">You're on the Free plan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade to unlock more verifications and priority support.
              </p>
            </div>
            {freeProjects.length > 0 && (
              <Button asChild size="sm" className="gap-2">
                <Link to={`/projects/${freeProjects[0].id}/upgrade`}>
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade Now
                </Link>
              </Button>
            )}
          </div>
        )}

        {paidProjects.map((project) => {
          const plan = getPlanById(project.selectedPlanId ?? null)
          const Icon = plan.icon
          const deadline = project.deadline
            ? format(new Date(project.deadline), "MMM d, yyyy")
            : "—"

          return (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{project.name}</p>
                    <Badge variant="secondary" className="text-xs">{plan.name}</Badge>
                    <Badge className="text-xs bg-green-500/15 text-green-600 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.tokens.toLocaleString()} tokens/month · Renews {deadline}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0">
                <Link to={`/projects/${project.id}/upgrade`}>
                  Upgrade
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )
        })}

        {freeProjects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{project.name}</p>
                  <Badge variant="outline" className="text-xs">Free</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {plans[0].tokens.toLocaleString()} tokens/month · No renewal
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1 shrink-0">
              <Link to={`/projects/${project.id}/upgrade`}>
                <Zap className="h-3.5 w-3.5" />
                Upgrade
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Section B — Payment History ──────────────────────────────────────────────

function PaymentHistorySection() {
  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ["payment-history"],
    queryFn: fetchPaymentHistory,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Payment History</CardTitle>
        </div>
        <CardDescription>Your last 50 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isError && (
          <p className="text-sm text-destructive text-center py-6">
            Failed to load payment history. Please try again.
          </p>
        )}

        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))}

              {!isLoading && payments && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p className="text-sm font-medium">No payment history yet</p>
                      <p className="text-xs">Your transactions will appear here once you upgrade.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                payments?.map((payment) => {
                  const plan = getPlanById(payment.planId)
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {payment.createdAt
                          ? format(new Date(payment.createdAt), "MMM d, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {payment.projectName ?? `Project #${payment.projectId}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <PlanIcon planId={payment.planId} />
                          {plan.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.isYearly ? "Yearly" : "Monthly"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ${payment.amount}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status as PaymentStatus} />
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Section C — Usage Summary ────────────────────────────────────────────────

function UsageSummarySection() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Usage Summary</CardTitle>
        </div>
        <CardDescription>Token consumption across your projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}

        {!isLoading && (projects ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No projects yet.
          </p>
        )}

        {!isLoading &&
          (projects ?? []).map((project) => {
            const plan = getPlanById(project.selectedPlanId ?? null)
            const Icon = plan.icon
            const totalTokens = plan.tokens
            const remaining = project.remainingtokens ?? 0
            const used = Math.max(0, totalTokens - remaining)
            const usedPct = totalTokens > 0 ? Math.min(100, (used / totalTokens) * 100) : 0
            const isFree = project.selectedPlanId == null
            const deadline = project.deadline
              ? format(new Date(project.deadline), "MMM d, yyyy")
              : null

            return (
              <div
                key={project.id}
                className="rounded-lg border border-border/60 bg-card/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{project.name}</span>
                    <Badge variant={isFree ? "outline" : "secondary"} className="text-xs">
                      {plan.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {deadline && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Resets {deadline}
                      </span>
                    )}
                    {isFree && (
                      <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Link to={`/projects/${project.id}/upgrade`}>
                          <Zap className="h-3 w-3" />
                          Upgrade
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{used.toLocaleString()} used</span>
                    <span>{remaining.toLocaleString()} remaining / {totalTokens.toLocaleString()} total</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscriptions and payment history
        </p>
      </div>

      <CurrentSubscriptionSection />
      <PaymentHistorySection />
      <UsageSummarySection />
    </div>
  )
}
