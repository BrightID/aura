import { useNavigate, useSearchParams } from "@solidjs/router"
import { createMemo, For, Show } from "solid-js"
import FadeIn from "@/components/motions/fade-in"
import { useRequireSession } from "@/hooks/use-require-session"
import { setOnboardingStore } from "@/store/onboarding"

/** Copy ported from the old app's playerOnboarding translations. */
const STEPS: { title: string; description: string }[] = [
  {
    title: "Find a Subject",
    description:
      "Find your friends and family in your BrightID connections to help verify them",
  },
  {
    title: "Gather Information",
    description:
      "Gather information to help you to make an accurate evaluation — see who has connected to the subject in BrightID and how other Aura players have evaluated them",
  },
  {
    title: "Evaluate the Subject",
    description:
      "Once you have enough information, tell other players what you think about the subject and how confident you are about your answer",
  },
  {
    title: "Level up",
    description:
      "To be effective at helping others get verified, you'll need to reach higher levels. Reach level 1+ by playing well and finding trainers to evaluate your play.",
  },
]

/**
 * /onboarding — 4-step tutorial. Step lives in the URL (?step=1..4); the old
 * Swiper carousel is replaced by simple step navigation (no new deps).
 */
export default function OnboardingPage() {
  useRequireSession()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const step = createMemo(() => {
    const n = Number(params.step)
    return Number.isInteger(n) && n >= 1 && n <= STEPS.length ? n : 1
  })
  const current = () => STEPS[step() - 1]
  const isLast = () => step() === STEPS.length

  const goTo = (n: number) => setParams({ step: String(n) })

  const next = () => {
    if (!isLast()) return goTo(step() + 1)
    setOnboardingStore("onboardingShown", true)
    navigate("/home")
  }

  return (
    <div
      data-testid="onboarding-guide"
      class="flex min-h-[calc(100vh-80px)] flex-col px-5.5 pt-14 pb-4"
    >
      <section
        class="content pl-5 pr-10"
        data-testid={`onboarding-step-${step()}`}
      >
        <FadeIn delay={0.1}>
          <a-head class="mb-2 text-4xl">{current().title}</a-head>
        </FadeIn>
        <FadeIn delay={0.15}>
          <a-text size="lg" class="font-medium">
            {current().description}
          </a-text>
        </FadeIn>
      </section>

      <section class="actions mt-auto mb-24 flex items-center justify-between px-5">
        <div class="flex gap-2">
          <For each={STEPS}>
            {(_, i) => (
              <button
                type="button"
                aria-label={`Go to step ${i() + 1}`}
                onClick={() => goTo(i() + 1)}
                class={`h-2.5 cursor-pointer rounded-full transition-all ${
                  step() === i() + 1
                    ? "bg-primary w-10"
                    : "bg-muted-foreground/40 w-2.5"
                }`}
              />
            )}
          </For>
        </div>

        <a-button
          size="lg"
          data-testid={isLast() ? "onboarding-finish" : "onboarding-next"}
          onClick={next}
        >
          <Show when={isLast()} fallback="Next">
            Let's Start
          </Show>
        </a-button>
      </section>

      <footer class="text-muted-foreground flex justify-end text-sm">
        <span class="flex gap-1">
          <a-text class="text-muted-foreground/70">Powered by:</a-text>
          <a-text class="font-light">BrightID</a-text>
        </span>
      </footer>
    </div>
  )
}
