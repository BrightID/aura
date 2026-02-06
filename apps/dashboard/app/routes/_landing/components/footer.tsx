import { Github, Twitter, MessageCircle } from "lucide-react"
import { Link } from "react-router"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/favicon.ico" width={30} height={30} alt="aura" />

              <span className="text-xl font-bold text-foreground">Aura</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open, decentralized identity verification. Powered by BrightID.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                {
                  label: "Documentation",
                  to: "https://brightid.gitbook.io/aura",
                },
                {
                  label: "Get BrightID",
                  to: "https://brightid.gitbook.io/aura/getting-started/get-brightid",
                },
                {
                  label: "How to Play",
                  to: "https://brightid.gitbook.io/aura/how-to-play/home-screen",
                },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    target="_blank"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Roles</h3>
            <ul className="space-y-3">
              {[
                {
                  label: "Players",
                  to: "https://brightid.gitbook.io/aura/how-to-play/home-screen",
                },
                {
                  label: "Trainers",
                  to: "https://brightid.gitbook.io/aura/roles/trainers",
                },
                {
                  label: "Managers",
                  to: "https://brightid.gitbook.io/aura/roles/managers",
                },
                {
                  label: "Teams & Leagues",
                  to: "https://brightid.gitbook.io/aura/roles/teams",
                },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    target="_blank"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <div className="flex items-center gap-4">
              <Link
                to="https://discord.gg/y24xeXq7mj"
                target="_blank"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link
                to="https://github.com/BrightID"
                target="_blank"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                to="https://twitter.com/BrightIDProject"
                target="_blank"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aura. Part of the BrightID ecosystem.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="https://brightid.gitbook.io/aura"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="https://brightid.gitbook.io/aura"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
