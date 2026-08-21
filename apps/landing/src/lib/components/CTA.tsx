import { scrollReveal } from "$lib/scroll-reveal"

export default function CTA() {
  return (
    <section ref={scrollReveal} class="py-24 lg:py-32 relative overflow-hidden">
      <div aria-hidden="true" class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-[10%] w-[28rem] h-[28rem] rounded-full bg-cyan-500/20 blur-3xl animate-aurora-1" />
        <div class="absolute bottom-1/4 right-[10%] w-[28rem] h-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl animate-aurora-2" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-violet-500/15 blur-3xl animate-aurora-3" />
      </div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-300/25 bg-white/[0.04] backdrop-blur-sm mb-8">
          <a-icon name="sparkles" class="text-base text-cyan-300" />
          <span class="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200/80">
            Join the Aura Network
          </span>
        </div>

        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
          Ready to Get Verified?
        </h2>

        <p class="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          No forms, no ID scans, no data broker in the middle — just the people who
          already know you, vouching for you. It takes minutes to start.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/interface">
            <a-button size="lg" class="group animate-pulse-glow">
              <span class="inline-flex items-center gap-2">
                Get Verified Now
                <a-icon
                  name="arrow-right"
                  class="text-lg transition-transform group-hover:translate-x-1"
                />
              </span>
            </a-button>
          </a>
          <a href="/docs">
            <a-button variant="glass" size="lg">
              Explore Documentation
            </a-button>
          </a>
        </div>

        <p class="mt-8 text-sm text-muted-foreground">
          New to Aura?{" "}
          <a
            href="https://brightid.gitbook.io/aura"
            target="_blank"
            rel="noopener noreferrer"
            class="text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Read the full guide
          </a>
        </p>
      </div>
    </section>
  )
}
