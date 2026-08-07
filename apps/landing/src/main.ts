import "@aura/ui"
import "./index.css"

// ---------------------------------------------------------------------------
// Header: solid background once the user scrolls past the hero badge.
// ---------------------------------------------------------------------------
const header = document.getElementById("site-header")

const updateHeaderState = () => {
  if (!header) return
  const scrolled = window.scrollY > 50
  header.classList.toggle("bg-background/80", scrolled)
  header.classList.toggle("backdrop-blur-xl", scrolled)
  header.classList.toggle("border-b", scrolled)
  header.classList.toggle("border-border", scrolled)
  header.classList.toggle("bg-transparent", !scrolled)
}

updateHeaderState()
window.addEventListener("scroll", updateHeaderState, { passive: true })

// ---------------------------------------------------------------------------
// Mobile nav toggle
// ---------------------------------------------------------------------------
const mobileMenuButton = document.getElementById("mobile-menu-button")
const mobileMenu = document.getElementById("mobile-menu")
const menuIcon = mobileMenuButton?.querySelector('[data-icon="menu"]')
const closeIcon = mobileMenuButton?.querySelector('[data-icon="close"]')

const setMobileMenuOpen = (open: boolean) => {
  mobileMenu?.classList.toggle("hidden", !open)
  menuIcon?.classList.toggle("hidden", open)
  closeIcon?.classList.toggle("hidden", !open)
  mobileMenuButton?.setAttribute("aria-expanded", String(open))
}

mobileMenuButton?.addEventListener("click", () => {
  const isOpen = !mobileMenu?.classList.contains("hidden")
  setMobileMenuOpen(!isOpen)
})

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMobileMenuOpen(false))
})

// ---------------------------------------------------------------------------
// Scroll reveal for sections
// ---------------------------------------------------------------------------
const revealTargets = document.querySelectorAll<HTMLElement>(".reveal")

if (revealTargets.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.15 },
  )

  for (const target of revealTargets) {
    observer.observe(target)
  }
} else {
  for (const target of revealTargets) {
    target.classList.add("is-visible")
  }
}

// ---------------------------------------------------------------------------
// "How it works" step switcher
// ---------------------------------------------------------------------------
type Step = {
  icon: string
  title: string
  body: string
  href: string
  linkLabel: string
}

const steps: Step[] = [
  {
    icon: "shield",
    title: "Step 1: Verify",
    body: "Download BrightID, connect with people you know, and get evaluated by Aura's network of experts. Your verification becomes a portable attestation used across the entire ecosystem.",
    href: "/interface",
    linkLabel: "Try it in Get Verified",
  },
  {
    icon: "users",
    title: "Step 2: Evaluate",
    body: "Aura Core is where experts assess subjects and claims. Every evaluation feeds a reputation score that keeps bad actors out and good actors accountable.",
    href: "/core",
    linkLabel: "Open Aura Core",
  },
  {
    icon: "layout-dashboard",
    title: "Step 3: Integrate",
    body: "Teams building on Aura manage projects, keys, and billing from the Dashboard, and follow step-by-step guides in the Docs to wire verification into their product.",
    href: "/dashboard",
    linkLabel: "Open the Dashboard",
  },
  {
    icon: "sparkles",
    title: "Step 4: Ship",
    body: "End users complete a seamless, bot-resistant flow with no puzzles and no data collection. See exactly how it feels with the embeddable widget demo.",
    href: "/demo",
    linkLabel: "See the live demo",
  },
]

const stepTriggers = document.querySelectorAll<HTMLButtonElement>(".step-trigger")
const detailIcon = document.getElementById("step-detail-icon")
const detailTitle = document.getElementById("step-detail-title")
const detailBody = document.getElementById("step-detail-body")
const detailLink = document.getElementById("step-detail-link") as HTMLAnchorElement | null
const detailLinkLabel = document.getElementById("step-detail-link-label")

const setActiveStep = (index: number) => {
  const step = steps[index]
  if (!step) return

  detailIcon?.setAttribute("name", step.icon)
  if (detailTitle) detailTitle.textContent = step.title
  if (detailBody) detailBody.textContent = step.body
  if (detailLink) detailLink.href = step.href
  if (detailLinkLabel) detailLinkLabel.textContent = step.linkLabel

  for (const trigger of stepTriggers) {
    const isActive = trigger.dataset.step === String(index)
    const number = trigger.querySelector<HTMLElement>(".step-number")
    const icon = trigger.querySelector<HTMLElement>(".step-icon")

    trigger.classList.toggle("bg-primary/10", isActive)
    trigger.classList.toggle("border-primary", isActive)
    trigger.classList.toggle("bg-card", !isActive)
    trigger.classList.toggle("border-border", !isActive)

    number?.classList.toggle("bg-primary", isActive)
    number?.classList.toggle("text-primary-foreground", isActive)
    number?.classList.toggle("bg-secondary", !isActive)
    number?.classList.toggle("text-foreground", !isActive)

    icon?.classList.toggle("text-primary", isActive)
    icon?.classList.toggle("text-muted-foreground", !isActive)
  }
}

for (const trigger of stepTriggers) {
  trigger.addEventListener("click", () => {
    const index = Number(trigger.dataset.step ?? 0)
    setActiveStep(index)
  })
}

// ---------------------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------------------
const footerYear = document.getElementById("footer-year")
if (footerYear) {
  footerYear.textContent = `© ${new Date().getFullYear()} Aura. Part of the BrightID ecosystem.`
}
