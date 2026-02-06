import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { CheckCircle2, Network, Lock, Sparkles } from "lucide-react"

export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.2 })

  return (
    <section
      id="solution"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Meet Aura
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            An open, decentralized network where experts evaluate each other,
            generating privacy-preserving proofs for unique humanity, community
            membership, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Visual */}
          <div
            className={`transition-all duration-700 delay-200 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="relative">
              {/* Central Aura node */}
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-orange/30 animate-pulse" />
                <div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/50 to-orange/50 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-orange flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-primary-foreground mx-auto mb-2" />
                    <span className="text-primary-foreground font-bold text-lg">
                      AURA
                    </span>
                  </div>
                </div>

                {/* Orbiting nodes */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute w-12 h-12 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center"
                    style={{
                      top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                      left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                      transform: "translate(-50%, -50%)",
                      animation: `float 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                ))}
              </div>

              {/* Connection lines would go here in a more complex implementation */}
            </div>
          </div>

          {/* Right side - Features */}
          <div
            className={`space-y-6 transition-all duration-700 delay-400 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            {[
              {
                icon: Network,
                title: "Decentralized Verification",
                description:
                  "No central authority. Experts closest to the source of truth make evaluations, creating a resilient web of trust.",
              },
              {
                icon: Lock,
                title: "Privacy by Design",
                description:
                  "No information is shared with anyone who doesn't already know it. Verification happens through existing trust relationships.",
              },
              {
                icon: CheckCircle2,
                title: "Human-Backed Trust",
                description:
                  "Verification requires someone who knows you to vouch for your unique identity. This human connection is what makes Aura resistant to bots.",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
