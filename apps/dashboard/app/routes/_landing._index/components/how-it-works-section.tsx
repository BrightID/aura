import { useRef, useState } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Download, Users, Shield, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Download,
    title: "Get BrightID",
    description:
      "Download the BrightID mobile app to create a universal, socially recoverable identifier.",
    detail:
      "Available on iOS and Android. Your BrightID becomes your passport in the Aura network.",
  },
  {
    icon: Users,
    title: "Connect with People You Know",
    description:
      "Build connections with people in your social graph who can vouch for your unique humanity.",
    detail:
      "Aura relies on verification by people who already know you—no strangers reviewing your documents.",
  },
  {
    icon: Shield,
    title: "Expert Evaluation",
    description:
      "Aura's network of players, trainers, and managers evaluate identities using existing trust relationships.",
    detail:
      "Experts have skin in the game. Poor performance results in lower scores, removing bad actors quickly.",
  },
  {
    icon: CheckCircle,
    title: "Receive Your Verification",
    description:
      "Get a positive Aura verification level that unlocks access to apps requiring sybil-resistant identity.",
    detail:
      "Your verification is a digital attestation that can be used across the entire BrightID ecosystem.",
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.1 })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden bg-card/30"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Verification in Four Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No puzzles to solve. No personal data to share. Just human
            connections verifying human connections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Steps list */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.title}
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeStep === index
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/50"
                } ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-colors ${
                      activeStep === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  <step.icon
                    className={`w-6 h-6 transition-colors ${
                      activeStep === index
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Active step detail */}
          <div
            className={`transition-all duration-700 delay-300 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="sticky top-24">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-card to-orange/20 border border-border p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Background animation */}
                <div className="absolute inset-0 opacity-30">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    {(() => {
                      const StepIcon = steps[activeStep].icon
                      return <StepIcon className="w-12 h-12 text-primary" />
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Step {activeStep + 1}: {steps[activeStep].title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md">
                    {steps[activeStep].detail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
