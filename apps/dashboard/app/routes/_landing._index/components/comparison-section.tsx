"use client"

import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Check, X, Minus, HelpCircle } from "lucide-react"

type ComparisonValue = "yes" | "no" | "partial" | "unknown"

interface ComparisonRow {
  feature: string
  aura: ComparisonValue
  captcha: ComparisonValue
  governmentId: ComparisonValue
  phoneVerification: ComparisonValue
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Stops bots effectively",
    aura: "yes",
    captcha: "partial",
    governmentId: "yes",
    phoneVerification: "partial",
  },
  {
    feature: "Prevents duplicate accounts",
    aura: "yes",
    captcha: "no",
    governmentId: "unknown",
    phoneVerification: "partial",
  },
  {
    feature: "No personal data shared",
    aura: "yes",
    captcha: "no",
    governmentId: "no",
    phoneVerification: "no",
  },
  {
    feature: "Works without ID documents",
    aura: "yes",
    captcha: "yes",
    governmentId: "no",
    phoneVerification: "yes",
  },
  {
    feature: "Decentralized (no single point of failure)",
    aura: "yes",
    captcha: "no",
    governmentId: "no",
    phoneVerification: "no",
  },
  {
    feature: "Free for users",
    aura: "yes",
    captcha: "yes",
    governmentId: "partial",
    phoneVerification: "partial",
  },
  {
    feature: "Resistant to deepfakes",
    aura: "yes",
    captcha: "no",
    governmentId: "partial",
    phoneVerification: "partial",
  },
  {
    feature: "Verifiable on-chain",
    aura: "yes",
    captcha: "partial",
    governmentId: "partial",
    phoneVerification: "partial",
  },
]

function ComparisonIcon({ value }: { value: ComparisonValue }) {
  if (value === "yes")
    return (
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <Check className="w-5 h-5 text-primary" />
      </div>
    )

  if (value === "no")
    return (
      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
        <X className="w-5 h-5 text-destructive" />
      </div>
    )

  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <HelpCircle className="w-5 h-5 text-yellow-600" />
    </div>
  )
}

export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.1 })

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            How Aura Stacks Up
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how Aura compares to traditional identity verification methods.
          </p>
        </div>

        {/* Desktop Table */}
        <div
          className={`hidden lg:block transition-all duration-700 delay-200 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 bg-secondary/50">
              <div className="p-6 text-left font-semibold text-foreground border-r border-border">
                Feature
              </div>
              <div className="p-6 text-center font-semibold text-primary border-r border-border">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">A</span>
                  </div>
                  Aura
                </div>
              </div>
              <div className="p-6 text-center font-semibold text-muted-foreground border-r border-border">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    Bot
                  </div>
                  Captcha
                </div>
              </div>
              <div className="p-6 text-center font-semibold text-muted-foreground border-r border-border">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    ID
                  </div>
                  Government ID
                </div>
              </div>
              <div className="p-6 text-center font-semibold text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    Phone
                  </div>
                  Phone Verification
                </div>
              </div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-5 border-t border-border ${index % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}
              >
                <div className="p-5 text-left text-foreground border-r border-border">
                  {row.feature}
                </div>
                <div className="p-5 flex justify-center items-center border-r border-border bg-primary/5">
                  <ComparisonIcon value={row.aura} />
                </div>
                <div className="p-5 flex justify-center items-center border-r border-border">
                  <ComparisonIcon value={row.captcha} />
                </div>
                <div className="p-5 flex justify-center items-center border-r border-border">
                  <ComparisonIcon value={row.governmentId} />
                </div>
                <div className="p-5 flex justify-center items-center">
                  <ComparisonIcon value={row.phoneVerification} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {comparisonData.map((row, index) => (
            <div
              key={row.feature}
              className={`rounded-xl border border-border bg-card p-5 transition-all duration-500 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <h3 className="font-semibold text-foreground mb-4">
                {row.feature}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <ComparisonIcon value={row.aura} />
                  <span className="text-sm text-primary font-medium">Aura</span>
                </div>
                <div className="flex items-center gap-2">
                  <ComparisonIcon value={row.captcha} />
                  <span className="text-sm text-muted-foreground">Captcha</span>
                </div>
                <div className="flex items-center gap-2">
                  <ComparisonIcon value={row.governmentId} />
                  <span className="text-sm text-muted-foreground">Gov ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <ComparisonIcon value={row.phoneVerification} />
                  <span className="text-sm text-muted-foreground">Phone</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className={`flex flex-wrap justify-center gap-6 mt-8 transition-all duration-700 delay-500 ${isInView ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-center gap-2">
            <ComparisonIcon value="yes" />
            <span className="text-sm text-muted-foreground">Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <ComparisonIcon value="no" />
            <span className="text-sm text-muted-foreground">Not Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <ComparisonIcon value="unknown" />
            <span className="text-sm text-amber-600">
              Uncertain / Depends on Implementation
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
