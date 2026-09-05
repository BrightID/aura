import { scrollReveal } from '$lib/scroll-reveal';

export default function Comparison() {
  return (
    <section
      ref={scrollReveal}
      id="compare"
      class="py-24 lg:py-32 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_50%,rgba(34,211,238,0.08),transparent_70%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_50%,rgba(217,70,239,0.08),transparent_70%)]" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="font-mono text-primary text-xs uppercase tracking-[0.25em]">
            The Old Way vs. Aura
          </span>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Built to Replace Both
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div class="p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <div class="w-12 h-12 rounded-xl bg-rose-400/10 border border-rose-300/20 text-rose-300 flex items-center justify-center mb-5">
              <a-icon name="fingerprint" class="text-2xl" />
            </div>
            <h3 class="font-display text-lg font-semibold text-foreground mb-4">
              Traditional KYC
            </h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                Uploads your ID and biometrics to a company
              </li>
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                One breach exposes everyone at once
              </li>
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                Excludes anyone without formal documents
              </li>
            </ul>
          </div>

          <div class="p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <div class="w-12 h-12 rounded-xl bg-rose-400/10 border border-rose-300/20 text-rose-300 flex items-center justify-center mb-5">
              <a-icon name="circle-alert" class="text-2xl" />
            </div>
            <h3 class="font-display text-lg font-semibold text-foreground mb-4">
              Captchas &amp; Bot Checks
            </h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                Solved by bots, botched by humans
              </li>
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                Blocks real people with accessibility needs
              </li>
              <li class="flex items-start gap-2 text-sm text-muted-foreground">
                <a-icon
                  name="x"
                  class="text-base text-rose-300 mt-0.5 shrink-0"
                />
                Can't tell one person from ten accounts
              </li>
            </ul>
          </div>

          <div class="relative rounded-2xl p-px bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_50px_rgba(139,92,246,0.25)]">
            <div class="relative h-full p-8 rounded-[inherit] bg-background overflow-hidden">
              <div class="absolute top-0 right-0 w-40 h-40 rounded-full bg-fuchsia-400/15 blur-3xl" />
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/25 border border-cyan-300/30 text-cyan-300 flex items-center justify-center mb-5 relative z-10">
                <a-icon name="shield-check" class="text-2xl" />
              </div>
              <h3 class="font-display text-lg font-semibold mb-4 relative z-10 text-gradient">
                Aura
              </h3>
              <ul class="space-y-3 relative z-10">
                <li class="flex items-start gap-2 text-sm text-foreground">
                  <a-icon
                    name="check"
                    class="text-base text-cyan-300 mt-0.5 shrink-0"
                  />
                  Verified by people who already know you
                </li>
                <li class="flex items-start gap-2 text-sm text-foreground">
                  <a-icon
                    name="check"
                    class="text-base text-cyan-300 mt-0.5 shrink-0"
                  />
                  No ID, no biometrics, no central database
                </li>
                <li class="flex items-start gap-2 text-sm text-foreground">
                  <a-icon
                    name="check"
                    class="text-base text-cyan-300 mt-0.5 shrink-0"
                  />
                  One private attestation, reusable everywhere
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
