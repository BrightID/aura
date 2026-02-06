"use client"

import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import {
  Building2,
  TrendingUp,
  Users2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"

const useCases = [
  {
    title: "Unique Humanity",
    description:
      "Verify that each user is a real, unique person. Essential for airdrops, voting, and fair distribution.",
    icon: Users2,
  },
  {
    title: "Community Membership",
    description:
      "Prove membership in communities, DAOs, or organizations without revealing personal details.",
    icon: Building2,
  },
  {
    title: "Platform Moderation",
    description:
      "Trust scores help moderate platforms by giving verified humans more weight than potential bots.",
    icon: ShieldCheck,
  },
]

const stats = [
  { value: "0", label: "Puzzles Required" },
  { value: "100%", label: "Privacy Preserved" },
  { value: "∞", label: "Scalability" },
]

export function BusinessSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.1 })

  return (
    <section
      id="business"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div
            className={`transition-all duration-700 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              For Business
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
              Target Verified Users. Reward Trust.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Integrate Aura to let users log in using OAuth, Passkeys, or the
              BrightID mobile app. Reward users with higher identification
              scores and target your most trusted community members.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-500 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group"
                asChild
              >
                <Link to="https://brightid.gitbook.io/aura" target="_blank">
                  Integration Guide
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary bg-transparent"
                asChild
              >
                <Link to="https://discord.gg/y24xeXq7mj" target="_blank">
                  Join Discord
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Use cases */}
          <div
            className={`space-y-4 transition-all duration-700 delay-300 ${isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className={`group flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-x-2 ${
                  isInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: `${index * 100 + 400}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <useCase.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {useCase.description}
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
