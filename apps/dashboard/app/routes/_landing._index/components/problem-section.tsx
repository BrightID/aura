import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Bot, ShieldX, Wallet, Zap } from "lucide-react"

const problems = [
  {
    icon: Bot,
    title: "Bot Takeovers & Degraded UX",
    description:
      "Bots register thousands of accounts instantly to exploit airdrops, bonuses, or farming rewards.",
  },
  {
    icon: ShieldX,
    title: "User Drop-Off from Friction",
    description:
      "CAPTCHAs, KYC flows, and manual reviews frustrate real users, while sophisticated attackers still get through.",
  },
  {
    icon: Wallet,
    title: "KYC & AML Stop Very Little Fraud",
    description: (
      <>
        Traditional KYC and AML systems fail to stop large-scale abuse.{" "}
        <a
          href="https://www.gisreportsonline.com/r/why-anti-money-laundering-policies-are-failing/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-destructive underline hover:opacity-80"
        >
          Read analysis
        </a>{" "}
        ·{" "}
        <a
          href="https://disruptive-horizons.com/p/kyc-aml-destroying-world"
          target="_blank"
          rel="noopener noreferrer"
          className="text-destructive underline hover:opacity-80"
        >
          Research breakdown
        </a>
      </>
    ),
  },
  {
    icon: Zap,
    title: "Privacy Risks & Data Leaks",
    description:
      "Many bot-prevention solutions collect sensitive user data, creating centralized honeypots that attract attackers and increase the impact of breaches.",
  },
]

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.2 })

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* <span className="text-destructive font-medium text-sm uppercase tracking-wider">
            Bot Problem?
          </span> */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Do You Have a Bot Problem?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crypto projects lose millions to bots every launch. With Aura’s
            on-chain proof-of-humanity, bots are blocked before they even start
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className={`group p-8 rounded-2xl bg-card border border-border hover:border-destructive/50 transition-all duration-500 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                  <problem.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
