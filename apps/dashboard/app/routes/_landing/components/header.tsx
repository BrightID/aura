import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Link } from "react-router"
import { ChevronDown, Shield, Users, LayoutDashboard } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { to: "#problem", label: "Why Aura" },
    { to: "#solution", label: "Solution" },
    { to: "#how-it-works", label: "How It Works" },
    { to: "#features", label: "Features" },
    { to: "#business", label: "For Business" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <img src="/favicon.ico" width={30} height={30} alt="aura" />
            </div>
            <span className="text-xl font-bold text-foreground">Aura</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <a-popover align="center">
              <button
                slot="trigger"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1"
              >
                Use Aura
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div slot="content" className="w-72 p-2">
                <div className="grid gap-1">
                  <Link
                    to="https://aura-get-verified.vercel.app"
                    target="_blank"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Aura Verified</div>
                      <div className="text-xs text-muted-foreground">
                        Human uniqueness verification
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="https://aura.brightid.org"
                    target="_blank"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Aura Players</div>
                      <div className="text-xs text-muted-foreground">
                        Community & reputation hub
                      </div>
                    </div>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-muted-foreground">
                        Integrate with aura
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </a-popover>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="https://brightid.gitbook.io/aura" target="_blank">
              <a-button variant="ghost">Documentation</a-button>
            </Link>
            <Link to="/login">
              <a-button>Get Started</a-button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <nav className="flex flex-col px-4 py-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors py-2 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              <Link to="https://brightid.gitbook.io/aura" target="_blank">
                <a-button variant="ghost">Documentation</a-button>
              </Link>
              <Link to="https://aura.brightid.org" target="_blank">
                <a-button>Get Started</a-button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
