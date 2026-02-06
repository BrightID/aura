import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import { ParticlesBackground } from "@/components/particles-background"
import { useState } from "react"
import { plans } from "~/constants/subscriptions"

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="w-full overflow-hidden py-5">
      <ParticlesBackground />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mx-auto text-balance">
            {
              "Start building for free. Scale as you grow with flexible pricing designed for teams of all sizes."
            }
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span
              className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly
            </span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary text-xs"
            >
              Save 20%
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const savings =
              plan.monthlyPrice > 0 && isYearly
                ? (
                    ((plan.monthlyPrice - plan.yearlyPrice) /
                      plan.monthlyPrice) *
                    100
                  ).toFixed(0)
                : 0

            return (
              <Card
                key={plan.name}
                className={`group relative p-8 flex flex-col backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                  plan.popular
                    ? "border-primary/50 shadow-[0_0_40px_rgba(99,102,241,0.2)] bg-card/60 hover:shadow-[0_0_60px_rgba(99,102,241,0.3)]"
                    : "border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                } ${index === 1 ? "lg:scale-105" : ""}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
                    plan.popular
                      ? "bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/50"
                      : "bg-gradient-to-br from-primary/20 to-primary/5"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`}
                  />
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-300">
                      ${price}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                      {savings !== 0 && savings !== "0%" && isYearly && (
                        <span className="text-xs text-primary font-medium">
                          Save {savings}%
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 pt-6">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 group/item transition-all duration-200 hover:translate-x-1"
                        style={{
                          animationDelay: `${index * 100 + idx * 50}ms`,
                        }}
                      >
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/90">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full mt-8 transition-all duration-300 group-hover:shadow-lg ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>
            )
          })}
        </div>

        <div className="mt-24 text-center space-y-6">
          <div className="inline-block p-6 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50">
            <p className="text-muted-foreground">
              {"Need a custom plan? "}
              <a
                href="#contact"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1 group"
              >
                Contact our sales team
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              24/7 support
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
