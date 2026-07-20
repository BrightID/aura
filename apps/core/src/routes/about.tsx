import FadeIn from "@/components/motions/fade-in"

// `about.tsx` => `/about`.
function About() {
  return (
    <div class="flex min-h-[calc(100vh-80px)] flex-col px-5.5 pt-20 pb-4">
      <section class="content mb-auto pl-5 pr-12">
        <FadeIn delay={0.1}>
          <a-head class="mb-6 text-5xl">About</a-head>
        </FadeIn>
        <FadeIn delay={0.15}>
          <a-text size="lg" class="font-medium">
            Aura is a social consensus protocol where players evaluate each
            other to verify unique humans, built on BrightID.
          </a-text>
        </FadeIn>
      </section>

      <footer class="text-muted-foreground flex justify-between text-sm">
        <span class="flex gap-1">
          <a-text class="font-light">Version</a-text>
          <a-text>{__APP_VERSION__}</a-text>
        </span>
        <span class="flex gap-1">
          <a-text class="text-muted-foreground/70">Powered by:</a-text>
          <a-text class="font-light">BrightID</a-text>
        </span>
      </footer>
    </div>
  )
}

export default About
