<script lang="ts">
  import { scrollReveal } from "$lib/actions"
</script>

<section id="use-cases" use:scrollReveal class="py-24 lg:py-32 relative overflow-hidden">
  <div class="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_100%,rgba(217,70,239,0.1),transparent_70%)]"></div>

  <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <span class="font-mono text-primary text-xs uppercase tracking-[0.25em]">Use Cases</span>
      <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
        Where Your Verification Works
      </h2>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        One attestation, built to answer one question — "is this a real, unique
        person?" — everywhere that question comes up.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(34,211,238,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="key" class="text-2xl text-cyan-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Passwordless Login</h3>
        <p class="text-muted-foreground leading-relaxed">
          Sign in anywhere Aura is accepted with your BrightID — socially
          recoverable, and effectively unphishable.
        </p>
      </div>

      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-violet-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(167,139,250,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border border-violet-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="gift" class="text-2xl text-violet-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Grants &amp; Airdrops</h3>
        <p class="text-muted-foreground leading-relaxed">
          Prove you're one real person, so rewards reach real communities instead
          of sybil farms.
        </p>
      </div>

      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-fuchsia-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(217,70,239,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-400/20 to-cyan-400/20 border border-fuchsia-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="vote" class="text-2xl text-fuchsia-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Governance &amp; Voting</h3>
        <p class="text-muted-foreground leading-relaxed">
          One person, one vote — even in fully decentralized communities with no
          central ID checks.
        </p>
      </div>

      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-cyan-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(34,211,238,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="blocks" class="text-2xl text-cyan-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Proof of Personhood for Apps</h3>
        <p class="text-muted-foreground leading-relaxed">
          Let any product confirm you're a unique human without ever seeing your
          personal data.
        </p>
      </div>

      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-violet-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(167,139,250,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400/20 to-fuchsia-500/20 border border-violet-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="award" class="text-2xl text-violet-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Certifications &amp; Reputation</h3>
        <p class="text-muted-foreground leading-relaxed">
          Carry verified skills, roles, or community standing as portable,
          reusable attestations.
        </p>
      </div>

      <div class="group p-8 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-fuchsia-300/40 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(217,70,239,0.12)]">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-400/20 to-cyan-400/20 border border-fuchsia-300/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <a-icon name="shield" class="text-2xl text-fuchsia-300"></a-icon>
        </div>
        <h3 class="font-display text-xl font-semibold text-foreground mb-2">Sybil-Resistant Communities</h3>
        <p class="text-muted-foreground leading-relaxed">
          Keep forums, DAOs, and marketplaces free of duplicate accounts and bots.
        </p>
      </div>
    </div>

    <div class="mt-10 p-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <a-badge variant="outline">For Builders</a-badge>
        <p class="text-sm text-muted-foreground">Integrating Aura verification into your own product?</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/docs" class="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">Read the Docs</a>
        <a href="/dashboard" class="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">Open the Dashboard</a>
      </div>
    </div>
  </div>
</section>
