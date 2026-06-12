import FadeIn from "@/components/motions/fade-in"
import Scale from "@/components/motions/scale"
import { A } from "@solidjs/router"

const Splash = () => {
  return (
    <div class="flex flex-col h-[calc(100vh-80px)]">
      <section class="content pl-5 pr-12">
        <FadeIn delay={0.1}>
          <a-head data-testid="login-title" class="mb-3 text-5xl">
            Aura
          </a-head>
        </FadeIn>
        <FadeIn delay={0.15}>
          <a-text size="xl" class="mb-9 font-black">
            Welcome Aura player
          </a-text>
        </FadeIn>
        <FadeIn delay={0.2}>
          <a-text size="lg" class="font-medium">
            Level up to help your friends and family get Aura verified
          </a-text>
        </FadeIn>
      </section>

      <img
        src="/global/logo.png"
        class="mx-auto mt-20"
        width={150}
        height={150}
        alt="aura players"
      />

      <section class="mb-24 mt-auto text-center">
        <Scale delay={0.6}>
          <A href="/login">
            <a-button class="w-full" size="lg">
              Get Started
            </a-button>
          </A>
        </Scale>
      </section>
      <FadeIn delay={0.3}>
        <footer class="flex justify-between text-sm text-muted-foreground">
          <span class="flex gap-1">
            <a-text class="font-light">Version</a-text>
            <a-text class="">{__APP_VERSION__}</a-text>
          </span>
          <span class="flex gap-1">
            <a-text class="text-muted-foreground/70">Powered by:</a-text>
            <a-text class="font-light">BrightID</a-text>
          </span>
        </footer>
      </FadeIn>
    </div>
  )
}

export default Splash
