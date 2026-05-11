import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { toast } from "sonner"
import { getAuth } from "firebase/auth"
import axios from "axios"
import { API_BASE_URL } from "~/constants"
import type { plans } from "~/constants/subscriptions"
import {
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react"

type Plan = (typeof plans)[0]

interface CheckoutProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  plan: Plan
  projectId: number
  isYearly: boolean
  onSuccess: () => void
}

type PaymentStatus = "idle" | "pending" | "waiting" | "confirming" | "finished" | "failed" | "expired" | "partially_paid"

const CRYPTO_OPTIONS = [
  { value: "eth", label: "ETH" },
  { value: "btc", label: "BTC" },
  { value: "usdtbsc", label: "USDT (BSC)" },
  { value: "bnbbsc", label: "BNB" },
  { value: "usdttrc20", label: "USDT (TRC20)" },
]

async function getToken(): Promise<string> {
  const token = await getAuth().currentUser?.getIdToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export function PaymentCheckout({
  open,
  onOpenChange,
  plan,
  projectId,
  isYearly,
  onSuccess,
}: CheckoutProps) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
  const [tab, setTab] = useState<"hosted" | "crypto">("hosted")

  // Hosted invoice state
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Direct crypto state
  const [selectedCrypto, setSelectedCrypto] = useState("eth")
  const [cryptoLoading, setCryptoLoading] = useState(false)
  const [payAddress, setPayAddress] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState<number | null>(null)
  const [payCurrency, setPayCurrency] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Shared status
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [polling, setPolling] = useState(false)

  const reset = useCallback(() => {
    setInvoiceLoading(false)
    setInvoiceUrl(null)
    setOrderId(null)
    setCryptoLoading(false)
    setPayAddress(null)
    setPayAmount(null)
    setPayCurrency(null)
    setStatus("idle")
    setPolling(false)
  }, [])

  // Poll payment status until terminal
  useEffect(() => {
    if (!orderId || !polling) return
    if (["finished", "failed", "expired"].includes(status)) return

    const id = setInterval(async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get<{ status: PaymentStatus }>(
          `${API_BASE_URL}/api/payments/status/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setStatus(data.status)

        if (data.status === "finished") {
          setPolling(false)
          clearInterval(id)

          // Activate the plan
          const token2 = await getToken()
          await axios.post(
            `${API_BASE_URL}/api/projects/upgrade-project`,
            { planId: plan.id, projectId, orderId, isYearly },
            { headers: { Authorization: `Bearer ${token2}` } }
          )

          onSuccess()
          toast.success("Subscription activated!", {
            description: `You are now on the ${plan.name} plan.`,
          })
        } else if (["failed", "expired"].includes(data.status)) {
          setPolling(false)
          clearInterval(id)
        }
      } catch {
        // silent — keep polling
      }
    }, 5000)

    return () => clearInterval(id)
  }, [orderId, polling, status, plan, projectId, isYearly, onSuccess])

  const createInvoice = async () => {
    setInvoiceLoading(true)
    try {
      const token = await getToken()
      const successUrl = `${window.location.origin}/dashboard/projects/${projectId}/upgrade`
      const cancelUrl = window.location.href

      const { data } = await axios.post<{ orderId: string; invoiceUrl: string }>(
        `${API_BASE_URL}/api/payments/create-invoice`,
        { projectId, planId: plan.id, amount: price, isYearly, successUrl, cancelUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setOrderId(data.orderId)
      setInvoiceUrl(data.invoiceUrl)
      setStatus("waiting")
      setPolling(true)

      window.open(data.invoiceUrl, "_blank", "noopener,noreferrer")
    } catch {
      toast.error("Failed to create invoice. Please try again.")
    } finally {
      setInvoiceLoading(false)
    }
  }

  const createCryptoPayment = async () => {
    setCryptoLoading(true)
    try {
      const token = await getToken()
      const { data } = await axios.post<{
        orderId: string
        payAddress: string
        payAmount: number
        payCurrency: string
      }>(
        `${API_BASE_URL}/api/payments/create-payment`,
        { projectId, planId: plan.id, amount: price, payCurrency: selectedCrypto, isYearly },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setOrderId(data.orderId)
      setPayAddress(data.payAddress)
      setPayAmount(data.payAmount)
      setPayCurrency(data.payCurrency)
      setStatus("waiting")
      setPolling(true)
    } catch {
      toast.error("Failed to generate payment address. Please try again.")
    } finally {
      setCryptoLoading(false)
    }
  }

  const copyAddress = () => {
    if (!payAddress) return
    navigator.clipboard.writeText(payAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isTerminal = ["finished", "failed", "expired"].includes(status)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Upgrade to {plan.name}
          </DialogTitle>
          <DialogDescription>
            ${price}/{isYearly ? "year" : "month"} · {plan.tokens.toLocaleString()} verifications
          </DialogDescription>
        </DialogHeader>

        {/* Status banner */}
        {status !== "idle" && (
          <StatusBanner status={status} />
        )}

        {/* Finished state */}
        {status === "finished" && (
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        )}

        {/* Error/expired state */}
        {(status === "failed" || status === "expired") && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your payment did not complete. You can try again.
            </p>
            <Button variant="secondary" className="w-full" onClick={reset}>
              Try again
            </Button>
          </div>
        )}

        {/* Payment form — only show when idle */}
        {status === "idle" && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "hosted" | "crypto")}>
            <TabsList className="w-full">
              <TabsTrigger value="hosted" className="flex-1">Card / Any Crypto</TabsTrigger>
              <TabsTrigger value="crypto" className="flex-1">Direct Crypto</TabsTrigger>
            </TabsList>

            <TabsContent value="hosted" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Opens a secure NOWPayments page. Accepts Visa, Mastercard, and 200+ cryptocurrencies.
              </p>
              <Button
                className="w-full"
                onClick={createInvoice}
                disabled={invoiceLoading}
              >
                {invoiceLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating invoice…</>
                ) : (
                  <><ExternalLink className="mr-2 h-4 w-4" /> Pay ${price} →</>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {CRYPTO_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCrypto(c.value)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                      selectedCrypto === c.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={createCryptoPayment}
                disabled={cryptoLoading}
              >
                {cryptoLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating address…</>
                ) : (
                  `Generate ${selectedCrypto.toUpperCase()} address`
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Waiting for crypto payment — show address */}
        {status === "waiting" && payAddress && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Send exactly{" "}
              <strong className="text-foreground">
                {payAmount} {payCurrency?.toUpperCase()}
              </strong>{" "}
              to:
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="flex-1 text-xs break-all">{payAddress}</code>
              <button
                onClick={copyAddress}
                className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-muted"
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              This page auto-refreshes every 5 seconds. Do not close it until payment is confirmed.
            </p>
          </div>
        )}

        {/* Waiting for hosted invoice — already opened in new tab */}
        {status === "waiting" && invoiceUrl && !payAddress && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete payment in the tab that opened. This dialog will update automatically.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(invoiceUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Reopen payment page
            </Button>
          </div>
        )}

        {/* Confirming / in-transit */}
        {status === "confirming" && (
          <p className="text-sm text-muted-foreground text-center">
            Payment received — waiting for blockchain confirmation…
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StatusBanner({ status }: { status: PaymentStatus }) {
  const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    waiting: {
      label: "Waiting for payment",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock className="h-4 w-4" />,
    },
    confirming: {
      label: "Confirming on blockchain",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    },
    finished: {
      label: "Payment confirmed!",
      color: "bg-primary/10 text-primary border-primary/20",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    failed: {
      label: "Payment failed",
      color: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <XCircle className="h-4 w-4" />,
    },
    expired: {
      label: "Payment expired",
      color: "bg-destructive/10 text-destructive border-destructive/20",
      icon: <XCircle className="h-4 w-4" />,
    },
    partially_paid: {
      label: "Partially paid — contact support",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock className="h-4 w-4" />,
    },
  }

  const cfg = configs[status]
  if (!cfg) return null

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cfg.color}`}>
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  )
}
