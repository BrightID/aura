<script lang="ts">
  import { onMount } from "svelte"

  let scrolled = $state(false)
  let mobileOpen = $state(false)

  function handleScroll() {
    scrolled = window.scrollY > 50
  }

  function toggleMobile() {
    mobileOpen = !mobileOpen
  }

  function closeMobile() {
    mobileOpen = false
  }

  onMount(() => {
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  })
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
    ? 'bg-background/80 backdrop-blur-xl border-b border-border'
    : 'bg-transparent'}"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
    <div
      class="flex items-center justify-between gap-4 h-14 lg:h-16 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-2xl px-4 sm:px-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
    >
      <a href="/" class="flex items-center gap-2.5">
        <img src="/favicon.ico" width="28" height="28" alt="Aura" />
        <span class="font-display text-lg font-bold tracking-tight text-foreground">Aura</span>
        <span
          class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
        ></span>
      </a>

      <nav class="hidden lg:flex items-center gap-8">
        <a href="#why" class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors">Why Aura</a>
        <a href="#how-it-works" class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors">How It Works</a>
        <a href="#use-cases" class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors">Use Cases</a>
        <a href="#faq" class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors">FAQ</a>
      </nav>

      <div class="hidden lg:flex items-center gap-3">
        <a href="/docs"><a-button variant="ghost" size="sm">Docs</a-button></a>
        <a href="/interface"><a-button size="sm">Get Verified</a-button></a>
      </div>

      <button
        class="lg:hidden p-2 text-foreground hover:text-cyan-300 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        onclick={toggleMobile}
      >
        {#if mobileOpen}
          <a-icon name="x" class="text-2xl"></a-icon>
        {:else}
          <a-icon name="menu" class="text-2xl"></a-icon>
        {/if}
      </button>
    </div>

    {#if mobileOpen}
      <div
        class="lg:hidden mt-2 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <nav class="flex flex-col px-4 py-4 gap-2">
          <a href="#why" onclick={closeMobile} class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2">Why Aura</a>
          <a href="#how-it-works" onclick={closeMobile} class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2">How It Works</a>
          <a href="#use-cases" onclick={closeMobile} class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2">Use Cases</a>
          <a href="#faq" onclick={closeMobile} class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2">FAQ</a>
          <div class="flex flex-col gap-2 pt-4 border-t border-border/70 mt-2">
            <a href="/docs" onclick={closeMobile}><a-button variant="ghost" class="w-full">Docs</a-button></a>
            <a href="/interface" onclick={closeMobile}><a-button class="w-full">Get Verified</a-button></a>
          </div>
        </nav>
      </div>
    {/if}
  </div>
</header>
