import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Shield, Users, Zap, RefreshCw, Globe, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Expert Defense Network",
    description:
      "Aura's verification is handled by motivated experts who actively protect the network. Bots and fake accounts face trained defenders, not casual users.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Accountability",
    description:
      "Participants have skin in the game. Poor performance or attack participation results in score drops, quickly removing bad actors from influence.",
    color: "text-orange",
    bgColor: "bg-orange/10",
  },
  {
    icon: Zap,
    title: "Resilience",
    description:
      "Quick reaction capability means a large sybil attack can be stopped with a single evaluation change. Coexisting teams add redundancy.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: RefreshCw,
    title: "Decentralization",
    description:
      "Multiple teams provide redundancy. If one becomes compromised, leagues exclude it and Aura continues operating with remaining teams.",
    color: "text-orange",
    bgColor: "bg-orange/10",
  },
  {
    icon: Globe,
    title: "Regional Scaling",
    description:
      "Apps can pay leagues to expand verification into new regions. The need for verification drives well-connected users to become Aura players.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Award,
    title: "Reward System",
    description:
      "Evaluation scores provide a convenient scale for monetary rewards distributed to participants within teams, incentivizing quality work.",
    color: "text-orange",
    bgColor: "bg-orange/10",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.1 })

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Built for Security & Scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aura's architecture ensures the network remains secure, resilient,
            and capable of growing globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
