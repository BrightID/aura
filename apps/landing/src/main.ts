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
    icon: "smartphone",
    title: "Step 1: Get BrightID",
    body: "Download the free BrightID app — your identity anchor, independent of any single product. It's the only account you'll need across the entire Aura network.",
    href: "https://brightid.gitbook.io/aura/getting-started/get-brightid",
    linkLabel: "Get BrightID",
  },
  {
    icon: "users",
    title: "Step 2: Make Real Connections",
    body: "Connect with people who actually know you — in person or online. A couple of trusted recovery connections go a long way toward a strong Aura score.",
    href: "https://brightid.gitbook.io/aura/getting-started/get-brightid",
    linkLabel: "See the connection guide",
  },
  {
    icon: "qr-code",
    title: "Step 3: Link to Aura",
    body: "Open Aura Verified and log in by scanning your BrightID QR code — no signup form, no password, no personal details to type in.",
    href: "/interface",
    linkLabel: "Open Aura Verified",
  },
  {
    icon: "eye-off",
    title: "Step 4: Get Evaluated",
    body: "People who already know you confirm you're a real, unique person. Nothing new about you is ever shared — Aura's privacy-preserving proofs see to that.",
    href: "https://brightid.gitbook.io/aura",
    linkLabel: "How evaluation works",
  },
  {
    icon: "sparkles",
    title: "Step 5: You're Verified",
    body: "Your Aura attestation is ready to use — log in, claim a grant, vote, or pass any check that needs a real human, anywhere Aura is accepted.",
    href: "/interface",
    linkLabel: "Get Verified now",
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
  if (detailLink) {
    detailLink.href = step.href
    const isExternal = step.href.startsWith("http")
    detailLink.target = isExternal ? "_blank" : ""
    detailLink.rel = isExternal ? "noopener noreferrer" : ""
  }
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
