import { A } from "@solidjs/router"
import FadeIn from "@/components/motions/fade-in"

export default function NotFound() {
  return (
    <div class="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-5 text-center">
      <FadeIn delay={0.1}>
        <a-head class="text-6xl">404</a-head>
      </FadeIn>
      <FadeIn delay={0.15}>
        <a-text size="lg" class="font-medium">
          This page doesn't exist.
        </a-text>
      </FadeIn>
      <FadeIn delay={0.2}>
        <A href="/home">
          <a-button size="lg">Go home</a-button>
        </A>
      </FadeIn>
    </div>
  )
}
