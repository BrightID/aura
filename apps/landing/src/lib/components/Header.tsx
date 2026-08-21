import { createSignal, onMount, onCleanup, Show } from "solid-js"

export default function Header() {
  const [scrolled, setScrolled] = createSignal(false)
  const [mobileOpen, setMobileOpen] = createSignal(false)

  const toggleMobile = () => setMobileOpen(!mobileOpen())
  const closeMobile = () => setMobileOpen(false)

  onMount(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    onCleanup(() => window.removeEventListener("scroll", handleScroll))
  })

  return (
    <header
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled()
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div class="flex items-center justify-between gap-4 h-14 lg:h-16 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-2xl px-4 sm:px-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <a href="/" class="flex items-center gap-2.5">
            <img src="/favicon.ico" width="28" height="28" alt="Aura" />
            <span class="font-display text-lg font-bold tracking-tight text-foreground">
              Aura
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </a>

          <nav class="hidden lg:flex items-center gap-8">
            <a
              href="#why"
              class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors"
            >
              Why Aura
            </a>
            <a
              href="#how-it-works"
              class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#use-cases"
              class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#faq"
              class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div class="hidden lg:flex items-center gap-3">
            <a href="/docs">
              <a-button variant="ghost" size="sm">
                Docs
              </a-button>
            </a>
            <a href="/interface">
              <a-button size="sm">Get Verified</a-button>
            </a>
          </div>

          <button
            class="lg:hidden p-2 text-foreground hover:text-cyan-300 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen()}
            onClick={toggleMobile}
          >
            {mobileOpen() ? (
              <a-icon name="x" class="text-2xl" />
            ) : (
              <a-icon name="menu" class="text-2xl" />
            )}
          </button>
        </div>

        <Show when={mobileOpen()}>
          <div class="lg:hidden mt-2 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <nav class="flex flex-col px-4 py-4 gap-2">
              <a
                href="#why"
                onClick={closeMobile}
                class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2"
              >
                Why Aura
              </a>
              <a
                href="#how-it-works"
                onClick={closeMobile}
                class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2"
              >
                How It Works
              </a>
              <a
                href="#use-cases"
                onClick={closeMobile}
                class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2"
              >
                Use Cases
              </a>
              <a
                href="#faq"
                onClick={closeMobile}
                class="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-cyan-300 transition-colors py-2"
              >
                FAQ
              </a>
              <div class="flex flex-col gap-2 pt-4 border-t border-border/70 mt-2">
                <a href="/docs" onClick={closeMobile}>
                  <a-button variant="ghost" class="w-full">
                    Docs
                  </a-button>
                </a>
                <a href="/interface" onClick={closeMobile}>
                  <a-button class="w-full">Get Verified</a-button>
                </a>
              </div>
            </nav>
          </div>
        </Show>
      </div>
    </header>
  )
}
