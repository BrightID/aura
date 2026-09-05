export default function Footer() {
  return (
    <footer class="py-12 border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="md:col-span-1">
            <a href="/" class="flex items-center gap-2.5 mb-4">
              <img src="/favicon.ico" width="28" height="28" alt="Aura" />
              <span class="font-display text-xl font-bold tracking-tight text-foreground">
                Aura
              </span>
            </a>
            <p class="text-sm text-muted-foreground leading-relaxed">
              An open, decentralized protocol for proving you're a real, unique
              human — without giving up your privacy. Part of the BrightID
              ecosystem.
            </p>
          </div>

          <div>
            <h3 class="font-mono text-xs uppercase tracking-[0.22em] text-foreground mb-4">
              For Users
            </h3>
            <ul class="space-y-3">
              <li>
                <a
                  href="/interface/login"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Get Verified
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#use-cases"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Use Cases
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-mono text-xs uppercase tracking-[0.22em] text-foreground mb-4">
              For Builders
            </h3>
            <ul class="space-y-3">
              <li>
                <a
                  href="/docs"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/core"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Aura Core
                </a>
              </li>
              <li>
                <a
                  href="/demo"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Demo Integration
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-mono text-xs uppercase tracking-[0.22em] text-foreground mb-4">
              Community
            </h3>
            <ul class="space-y-3 mb-4">
              <li>
                <a
                  href="https://brightid.gitbook.io/aura"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Aura Documentation
                </a>
              </li>
              <li>
                <a
                  href="/interface/privacy-policy"
                  class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
            <div class="flex items-center gap-4">
              <a
                href="https://discord.gg/y24xeXq7mj"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                aria-label="Discord"
              >
                <a-icon name="message-circle" class="text-xl" />
              </a>
              <a
                href="https://github.com/Meta-Node/"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                aria-label="GitHub"
              >
                <a-icon name="github" class="text-xl" />
              </a>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aura. Part of the BrightID ecosystem.
          </p>
          <div class="flex items-center gap-6">
            <a
              href="https://brightid.gitbook.io/aura"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-muted-foreground hover:text-cyan-300 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
