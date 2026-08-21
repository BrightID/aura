import { createSignal, For, Show } from "solid-js"
import { scrollReveal } from "$lib/scroll-reveal"
import { steps } from "$lib/data"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = createSignal(0)

  const currentStep = () => steps[activeStep()]
  const isExternal = () => currentStep().href.startsWith("http")

  return (
    <section
      ref={scrollReveal}
      id="how-it-works"
      class="py-24 lg:py-32 relative overflow-hidden"
    >
      <div class="absolute inset-0 stars opacity-60" />
      <div class="absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_50%,rgba(34,211,238,0.08),transparent_70%)]" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="font-mono text-primary text-xs uppercase tracking-[0.25em]">
            How It Works
          </span>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            From Stranger to Verified in Five Steps
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            No forms, no ID scans. Just people you know, confirming what they already
            know.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div class="space-y-4">
            <For each={steps}>
              {(step, i) => (
                <button
                  type="button"
                  class={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                    activeStep() === i()
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-cyan-300/30"
                  }`}
                  onClick={() => setActiveStep(i())}
                >
                  <div class="flex items-center gap-4">
                    <div
                      class={`flex items-center justify-center w-12 h-12 rounded-full font-display font-bold text-lg transition-colors ${
                        activeStep() === i()
                          ? "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(34,211,238,0.4)]"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {i() + 1}
                    </div>
                    <div class="flex-1">
                      <h3 class="font-display text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p class="text-sm text-muted-foreground mt-1">{step.body}</p>
                    </div>
                    <a-icon
                      name={step.icon}
                      class={`text-xl transition-colors ${
                        activeStep() === i() ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </button>
              )}
            </For>
          </div>

          <div>
            <div class="sticky top-28">
              <div class="relative min-h-[28rem] rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-card to-fuchsia-500/10 backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.1)]">
                <div class="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-cyan-400/15 blur-3xl animate-float" />
                <div
                  class="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-fuchsia-400/15 blur-3xl animate-float"
                  style={{ "animation-delay": "-3s" }}
                />
                <div class="relative z-10">
                  <div class="w-24 h-24 rounded-full bg-cyan-400/15 border border-cyan-300/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                    <a-icon name={currentStep().icon} class="text-4xl text-cyan-300" />
                  </div>
                  <h3 class="font-display text-2xl font-bold text-foreground mb-4">
                    {currentStep().title}
                  </h3>
                  <p class="text-muted-foreground leading-relaxed max-w-md">
                    {currentStep().body}
                  </p>
                  <a
                    href={currentStep().href}
                    target={isExternal() ? "_blank" : undefined}
                    rel={isExternal() ? "noopener noreferrer" : undefined}
                    class="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors mt-6"
                  >
                    {currentStep().linkLabel}
                    <a-icon name="arrow-right" class="text-base" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
