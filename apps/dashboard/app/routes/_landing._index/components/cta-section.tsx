import { useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { threshold: 0.3 })

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div
            className="absolute inset-12 rounded-full bg-orange/20 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              Join the Future of Identity
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Ready to Leave Captchas Behind?
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the open, decentralized network that's redefining how we verify
            human identity online. No puzzles. No data collection. Just trust.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg group animate-pulse-glow"
              asChild
            >
              <Link to="https://aura.brightid.org" target="_blank">
                Get Verified Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg border-border hover:bg-secondary bg-transparent"
              asChild
            >
              <Link to="https://brightid.gitbook.io/aura" target="_blank">
                Explore Documentation
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Questions?{" "}
            <Link
              to="https://discord.gg/y24xeXq7mj"
              target="_blank"
              className="text-primary hover:underline"
            >
              Join the Aura Discord community
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
