import { scrollReveal } from '$lib/scroll-reveal';

export default function WhyAura() {
  return (
    <section
      ref={scrollReveal}
      id="why"
      class="py-24 lg:py-32 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent_70%)]" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="font-mono text-primary text-xs uppercase tracking-[0.25em]">
            The Problem
          </span>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Captchas and KYC Both Fail You
          </h2>
          <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
            Captchas frustrate real humans and still get solved by bots. KYC
            hands your ID and biometrics to a company you'll never meet, just so
            it can decide if you're "real." Neither one actually knows you. Aura
            replaces both with something that does — the people already in your
            life.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div class="relative w-72 h-72 mx-auto">
              <div class="absolute inset-0 rounded-full border border-white/10" />
              <div class="absolute inset-6 rounded-full border border-cyan-300/20" />
              <div class="absolute inset-12 rounded-full border border-violet-300/25" />
              <div class="absolute inset-16 rounded-full bg-gradient-to-br from-cyan-400/30 via-violet-500/30 to-fuchsia-500/30 blur-xl animate-pulse" />
              <div class="absolute inset-20 rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,211,238,0.45)]">
                <div class="text-center">
                  <a-icon
                    name="sparkles"
                    class="text-3xl text-primary-foreground mx-auto mb-2 block w-fit"
                  />
                  <span class="text-primary-foreground font-display font-bold text-lg">
                    YOU
                  </span>
                </div>
              </div>
              <div
                class="orbit-wrap absolute inset-0"
                style={{ animation: 'orbit-spin 24s linear infinite' }}
              >
                <div
                  class="absolute w-11 h-11 rounded-full border border-cyan-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                  style={{
                    top: '2%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-cyan-300" />
                </div>
                <div
                  class="absolute w-11 h-11 rounded-full border border-violet-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.35)]"
                  style={{
                    top: '26.5%',
                    left: '93.3%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-violet-300" />
                </div>
                <div
                  class="absolute w-11 h-11 rounded-full border border-fuchsia-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.35)]"
                  style={{
                    top: '73.5%',
                    left: '93.3%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-fuchsia-300" />
                </div>
                <div
                  class="absolute w-11 h-11 rounded-full border border-cyan-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                  style={{
                    top: '98%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-cyan-300" />
                </div>
                <div
                  class="absolute w-11 h-11 rounded-full border border-violet-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.35)]"
                  style={{
                    top: '73.5%',
                    left: '6.7%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-violet-300" />
                </div>
                <div
                  class="absolute w-11 h-11 rounded-full border border-fuchsia-300/50 bg-background/80 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.35)]"
                  style={{
                    top: '26.5%',
                    left: '6.7%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div class="w-3 h-3 rounded-full bg-fuchsia-300" />
                </div>
              </div>
            </div>
            <p class="text-center text-sm text-muted-foreground mt-8 max-w-xs mx-auto">
              Your connections — friends, family, coworkers — already know
              you're real. Aura just gives that knowledge a cryptographic voice.
            </p>
          </div>

          <div class="space-y-6">
            <div class="group flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.06] transition-all duration-300">
              <div class="p-3 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-300/20 text-cyan-300 group-hover:scale-110 transition-transform">
                <a-icon name="users" class="text-2xl" />
              </div>
              <div>
                <h3 class="font-display text-xl font-semibold text-foreground mb-2">
                  Verified by People Who Know You
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                  Aura turns the trust that already exists between you and your
                  connections into a portable proof — no strangers, no
                  back-office reviewers, no central authority deciding who
                  counts as real.
                </p>
              </div>
            </div>
            <div class="group flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-violet-300/40 hover:bg-white/[0.06] transition-all duration-300">
              <div class="p-3 rounded-xl bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border border-violet-300/20 text-violet-300 group-hover:scale-110 transition-transform">
                <a-icon name="lock" class="text-2xl" />
              </div>
              <div>
                <h3 class="font-display text-xl font-semibold text-foreground mb-2">
                  Nothing New Is Shared
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                  You never upload an ID or a selfie. Evaluators confirm only
                  what they already know about you — Aura's privacy-preserving
                  proofs keep that confirmation from leaking anything extra,
                  even to Aura itself.
                </p>
              </div>
            </div>
            <div class="group flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-fuchsia-300/40 hover:bg-white/[0.06] transition-all duration-300">
              <div class="p-3 rounded-xl bg-gradient-to-br from-fuchsia-400/20 to-cyan-400/20 border border-fuchsia-300/20 text-fuchsia-300 group-hover:scale-110 transition-transform">
                <a-icon name="check-circle-2" class="text-2xl" />
              </div>
              <div>
                <h3 class="font-display text-xl font-semibold text-foreground mb-2">
                  One Attestation, Everywhere
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                  Get verified once and reuse the same proof to log in, claim a
                  grant, vote, or pass any check that needs a real, unique human
                  — no repeating the process for every app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
