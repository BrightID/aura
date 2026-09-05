import { scrollReveal } from '$lib/scroll-reveal';

export default function Hero() {
  return (
    <section
      ref={scrollReveal}
      class="relative min-h-screen flex items-center justify-center py-28 lg:py-32 overflow-hidden"
    >
      <div aria-hidden="true" class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div class="absolute inset-0 stars" />
        <div class="absolute -top-24 left-[5%] w-[34rem] h-[34rem] rounded-full bg-cyan-500/25 blur-3xl animate-aurora-1" />
        <div class="absolute top-[15%] right-[5%] w-[30rem] h-[30rem] rounded-full bg-violet-500/25 blur-3xl animate-aurora-2" />
        <div class="absolute bottom-[-8%] left-[30%] w-[36rem] h-[36rem] rounded-full bg-fuchsia-500/20 blur-3xl animate-aurora-3" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,4,12,0.85))]" />
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-300/20 bg-white/[0.04] backdrop-blur-sm mb-8">
          <div class="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          <span class="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200/80">
            Open Protocol · Powered by BrightID
          </span>
        </div>

        <h1 class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight mb-8">
          <span class="block text-foreground">Prove you're human.</span>
          <span class="block text-gradient glow-text">Not who you are.</span>
        </h1>

        <p class="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
          Aura verifies real, unique people through the community that already
          knows them — no ID uploads, no biometric scans, no central database to
          breach. Get verified once, then carry that proof anywhere Aura is
          accepted.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-20">
          <a href="/interface/login" class="inline-flex">
            <a-button
              size="lg"
              class="group min-w-[13rem] shadow-[0_0_32px_oklch(80%_0.12_195_/_0.28)]"
            >
              <span class="inline-flex items-center gap-2">
                Get Verified
                <a-icon
                  name="arrow-right"
                  class="text-lg transition-transform group-hover:translate-x-1"
                />
              </span>
            </a-button>
          </a>
          <a href="#how-it-works" class="inline-flex">
            <a-button variant="glass" size="lg" class="min-w-[13rem]">
              <span class="inline-flex items-center gap-2">
                <a-icon name="sparkles" class="text-lg text-cyan-300" />
                See How It Works
              </span>
            </a-button>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div class="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-300/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <a-icon name="shield-check" class="text-2xl text-cyan-300" />
            </div>
            <div class="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              No ID Required
            </div>
            <div class="font-display text-lg font-semibold text-foreground">
              Verified by People, Not Paperwork
            </div>
          </div>
          <div class="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-violet-300/40 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border border-violet-300/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <a-icon name="eye-off" class="text-2xl text-violet-300" />
            </div>
            <div class="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Privacy by Design
            </div>
            <div class="font-display text-lg font-semibold text-foreground">
              Nothing New Ever Shared
            </div>
          </div>
          <div class="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-fuchsia-300/40 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(217,70,239,0.15)]">
            <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-fuchsia-400/20 to-cyan-400/20 border border-fuchsia-300/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <a-icon name="network" class="text-2xl text-fuchsia-300" />
            </div>
            <div class="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              One Proof
            </div>
            <div class="font-display text-lg font-semibold text-foreground">
              Works Across Every App
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Scroll to explore
        </span>
        <div class="w-6 h-10 rounded-full border-2 border-cyan-300/30 flex justify-center pt-2">
          <div class="w-1.5 h-3 rounded-full bg-cyan-300 animate-bounce shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
        </div>
      </div>
    </section>
  );
}
