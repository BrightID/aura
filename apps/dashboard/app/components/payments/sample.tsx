"use client"

import { useCallback, useEffect, useState } from "react"

// --- Types ---

type PaymentMethod = "invoice" | "crypto"
type PaymentStatus =
  | "idle"
  | "pending"
  | "waitingPayment"
  | "waitingAuthorization"
  | "inProgress"
  | "completed"
  | "failed"

interface PaymentState {
  method: PaymentMethod
  status: PaymentStatus
  widgetUrl?: string
  error?: string
}

interface CheckoutProps {
  orderId: string
  amount: number
  currency?: string
  description?: string
  onSuccess?: (orderId: string) => void
  onError?: (error: string) => void
}

// --- Hook ---

export function useMoonPayment(orderId: string) {
  const [state, setState] = useState<PaymentState>({
    method: "invoice",
    status: "idle",
  })

  // Create hosted invoice — supports cards and crypto
  const createInvoice = useCallback(
    async (amount: number, successUrl: string, cancelUrl: string, description?: string) => {
      setState((s) => ({ ...s, status: "waitingPayment", error: undefined }))

      const res = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderId, successUrl, cancelUrl, description }),
      })

      if (!res.ok) throw new Error("Failed to create invoice")

      const { widgetUrl } = await res.json()
      setState((s) => ({ ...s, method: "invoice", widgetUrl }))

      return { widgetUrl }
    },
    [orderId],
  )

  // Create direct crypto payment — opens MoonPay widget pre-selected to currencyCode
  const createCryptoPayment = useCallback(
    async (amount: number, currencyCode: string, successUrl: string, cancelUrl: string) => {
      setState((s) => ({ ...s, status: "waitingPayment", error: undefined }))

      const res = await fetch("/api/payments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currencyCode, orderId, successUrl, cancelUrl }),
      })

      if (!res.ok) throw new Error("Failed to create payment")

      const data = await res.json()
      setState((s) => ({
        ...s,
        method: "crypto",
        widgetUrl: data.widgetUrl,
        status: "waitingPayment",
      }))

      return data
    },
    [orderId],
  )

  // Poll order status until terminal
  const pollStatus = useCallback((oid: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/status/${oid}`)
      if (!res.ok) return

      const { status } = await res.json()
      setState((s) => ({ ...s, status }))

      if (["completed", "failed"].includes(status)) {
        clearInterval(interval)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { state, createInvoice, createCryptoPayment, pollStatus }
}

// --- Status badge ---

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { label: string; color: string }> = {
    idle: { label: "Not started", color: "#6b7280" },
    pending: { label: "Pending", color: "#f59e0b" },
    waitingPayment: { label: "Waiting", color: "#f59e0b" },
    waitingAuthorization: { label: "Authorizing...", color: "#3b82f6" },
    inProgress: { label: "In progress...", color: "#3b82f6" },
    completed: { label: "Paid ✓", color: "#10b981" },
    failed: { label: "Failed", color: "#ef4444" },
  }

  const { label, color } = config[status]
  return <span style={{ color, fontWeight: 600, fontSize: 14 }}>{label}</span>
}

// --- Main checkout component ---

export function MoonPayCheckout({
  orderId,
  amount,
  currency = "usd",
  description,
  onSuccess,
  onError,
}: CheckoutProps) {
  const { state, createInvoice, createCryptoPayment, pollStatus } =
    useMoonPayment(orderId)

  const [selectedCrypto, setSelectedCrypto] = useState("eth")

  useEffect(() => {
    if (state.status === "waitingPayment") {
      return pollStatus(orderId)
    }
  }, [state.status, orderId, pollStatus])

  useEffect(() => {
    if (state.status === "completed") {
      onSuccess?.(orderId)
    }
    if (state.status === "failed") {
      onError?.(state.status)
    }
  }, [state.status, orderId, onSuccess, onError])

  const successUrl = typeof window !== "undefined" ? window.location.href : ""
  const cancelUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleInvoice = async () => {
    const { widgetUrl } = await createInvoice(amount, successUrl, cancelUrl, description)
    window.open(widgetUrl, "_blank") // opens MoonPay hosted page
  }

  const handleCrypto = async () => {
    const { widgetUrl } = await createCryptoPayment(amount, selectedCrypto, successUrl, cancelUrl)
    window.open(widgetUrl, "_blank")
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
          Opens a MoonPay hosted page. Accepts Visa, Mastercard, and 100+
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

      {/* Option 2: direct crypto via MoonPay widget */}
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
        <strong style={{ fontSize: 14 }}>Pay with specific crypto</strong>
        <div style={{ display: "flex", gap: 8 }}>
          {["eth", "btc", "usdt", "bnb"].map((c) => (
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
          Pay with {selectedCrypto.toUpperCase()} →
        </button>
      </div>
    </div>
  )
}
