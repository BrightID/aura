import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Zap } from "lucide-react"
import { Link } from "react-router"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = container.getBoundingClientRect()
      const x = (clientX - left) / width - 0.5
      const y = (clientY - top) / height - 0.5

      container.style.setProperty("--mouse-x", `${x * 20}px`)
      container.style.setProperty("--mouse-y", `${y * 20}px`)
    }

    container.addEventListener("mousemove", handleMouseMove)
    return () => container.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"
          style={{
            transform: "translate(var(--mouse-x, 0), var(--mouse-y, 0))",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange/20 rounded-full blur-3xl animate-float"
          style={{
            animationDelay: "-3s",
            transform:
              "translate(calc(var(--mouse-x, 0) * -1), calc(var(--mouse-y, 0) * -1))",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-transparent to-orange/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Human-Verified Identity for the Internet
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
          <span className="block">Identity That</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange animate-gradient glow-text">
            Actually Works
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Aura replaces captchas and invasive verification with expert-driven,
          privacy-preserving identity proofs. No puzzles. No personal data
          sharing. Empowering products with secure, decentralized confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg group animate-pulse-glow"
            asChild
          >
            <Link to="/login" target="_blank">
              Get Started
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
              Read the Docs
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Shield, label: "Privacy First", value: "Zero Data Shared" },
            {
              icon: Users,
              label: "Expert Network",
              value: "Decentralized Trust",
            },
            { icon: Zap, label: "No Puzzles", value: "Instant Verification" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className="w-8 h-8 text-primary mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-sm text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-lg font-semibold text-foreground">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  )
}
