"use client"

import { useCallback, useEffect, useState } from "react"

// --- Types ---

type PaymentMethod = "invoice" | "crypto"
type PaymentStatus =
  | "idle"
  | "waiting"
  | "confirming"
  | "confirmed"
  | "finished"
  | "failed"
  | "expired"
  | "partially_paid"

interface PaymentState {
  method: PaymentMethod
  status: PaymentStatus
  paymentId?: string
  payAddress?: string
  payAmount?: number
  payCurrency?: string
  invoiceUrl?: string
  error?: string
}

interface CheckoutProps {
  orderId: string
  amount: number
  currency?: string
  description?: string
  onSuccess?: (paymentId: string) => void
  onError?: (error: string) => void
}

// --- Hook ---

export function useNOWPayment(orderId: string) {
  const [state, setState] = useState<PaymentState>({
    method: "invoice",
    status: "idle",
  })

  // Create hosted invoice — supports both cards and crypto
  const createInvoice = useCallback(
    async (amount: number, currency = "usd", description?: string) => {
      setState((s) => ({ ...s, status: "waiting", error: undefined }))

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, orderId, description }),
      })

      if (!res.ok) throw new Error("Failed to create invoice")

      const { invoiceUrl, invoiceId } = await res.json()
      setState((s) => ({ ...s, method: "invoice", invoiceUrl }))

      return { invoiceUrl, invoiceId }
    },
    [orderId],
  )

  // Create direct crypto payment — customer sends to a wallet address
  const createCryptoPayment = useCallback(
    async (amount: number, payCurrency: string, currency = "usd") => {
      setState((s) => ({ ...s, status: "waiting", error: undefined }))

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, payCurrency, orderId }),
      })

      if (!res.ok) throw new Error("Failed to create payment")

      const data = await res.json()
      setState((s) => ({
        ...s,
        method: "crypto",
        paymentId: data.paymentId,
        payAddress: data.payAddress,
        payAmount: data.payAmount,
        payCurrency: data.payCurrency,
        status: data.status,
      }))

      return data
    },
    [orderId],
  )

  // Poll payment status (for crypto direct flow)
  const pollStatus = useCallback((paymentId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/${paymentId}`)
      if (!res.ok) return

      const { status } = await res.json()
      setState((s) => ({ ...s, status }))

      if (["finished", "failed", "expired"].includes(status)) {
        clearInterval(interval)
      }
    }, 5000) // poll every 5s

    return () => clearInterval(interval)
  }, [])

  return { state, createInvoice, createCryptoPayment, pollStatus }
}

// --- Status badge ---

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { label: string; color: string }> = {
    idle: { label: "Not started", color: "#6b7280" },
    waiting: { label: "Waiting", color: "#f59e0b" },
    confirming: { label: "Confirming...", color: "#3b82f6" },
    confirmed: { label: "Confirmed", color: "#10b981" },
    finished: { label: "Paid ✓", color: "#10b981" },
    failed: { label: "Failed", color: "#ef4444" },
    expired: { label: "Expired", color: "#ef4444" },
    partially_paid: { label: "Partial", color: "#f59e0b" },
  }

  const { label, color } = config[status]
  return <span style={{ color, fontWeight: 600, fontSize: 14 }}>{label}</span>
}

// --- Crypto address display ---

function CryptoPaymentDisplay({
  address,
  amount,
  currency,
}: {
  address: string
  amount: number
  currency: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
        Send exactly{" "}
        <strong>
          {amount} {currency.toUpperCase()}
        </strong>{" "}
        to:
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f3f4f6",
          borderRadius: 8,
          padding: "10px 14px",
        }}
      >
        <code style={{ flex: 1, fontSize: 13, wordBreak: "break-all" }}>
          {address}
        </code>
        <button
          onClick={copy}
          style={{
            flexShrink: 0,
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
        Send the exact amount — partial payments may require manual review.
      </p>
    </div>
  )
}

// --- Main checkout component ---

export function NOWPaymentCheckout({
  orderId,
  amount,
  currency = "usd",
  description,
  onSuccess,
  onError,
}: CheckoutProps) {
  const { state, createInvoice, createCryptoPayment, pollStatus } =
    useNOWPayment(orderId)

  const [selectedCrypto, setSelectedCrypto] = useState("eth")

  // Start polling once we have a paymentId
  useEffect(() => {
    if (state.paymentId && state.status === "waiting") {
      return pollStatus(state.paymentId)
    }
  }, [state.paymentId, state.status, pollStatus])

  // Notify parent on terminal states
  useEffect(() => {
    if (state.status === "finished" && state.paymentId) {
      onSuccess?.(state.paymentId)
    }
    if (["failed", "expired"].includes(state.status)) {
      onError?.(state.status)
    }
  }, [state.status, state.paymentId, onSuccess, onError])

  const handleInvoice = async () => {
    const { invoiceUrl } = await createInvoice(amount, currency, description)
    window.open(invoiceUrl, "_blank") // opens NOWPayments hosted page
  }

  const handleCrypto = async () => {
    await createCryptoPayment(amount, selectedCrypto, currency)
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>
          Pay {amount} {currency.toUpperCase()}
        </h2>
        <StatusBadge status={state.status} />
      </div>

      {state.error && (
        <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>
          {state.error}
        </p>
      )}

      {/* Option 1: hosted invoice (card + crypto) */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <strong style={{ fontSize: 14 }}>Pay with card or crypto</strong>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Opens a NOWPayments hosted page. Accepts Visa, Mastercard, and 200+
          cryptocurrencies.
        </p>
        <button
          onClick={handleInvoice}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Continue to payment →
        </button>
      </div>

      {/* Option 2: direct crypto address */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <strong style={{ fontSize: 14 }}>Pay directly with crypto</strong>
        <div style={{ display: "flex", gap: 8 }}>
          {["eth", "btc", "usdtbsc", "bnbbsc"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrypto(c)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${selectedCrypto === c ? "#111827" : "#e5e7eb"}`,
                background: selectedCrypto === c ? "#111827" : "#fff",
                color: selectedCrypto === c ? "#fff" : "#374151",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {state.payAddress ? (
          <CryptoPaymentDisplay
            address={state.payAddress}
            amount={state.payAmount!}
            currency={state.payCurrency!}
          />
        ) : (
          <button
            onClick={handleCrypto}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: "#fff",
              color: "#111827",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Generate {selectedCrypto.toUpperCase()} address
          </button>
        )}
      </div>
    </div>
  )
}
