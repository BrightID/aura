import { For } from "solid-js"
import { scrollReveal } from "$lib/scroll-reveal"
import { faqItems } from "$lib/data"

export default function FAQ() {
  return (
    <section ref={scrollReveal} id="faq" class="py-24 lg:py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(45%_50%_at_50%_0%,rgba(34,211,238,0.07),transparent_70%)]" />

      <div class="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="font-mono text-primary text-xs uppercase tracking-[0.25em]">
            FAQ
          </span>
          <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Questions, Answered
          </h2>
        </div>

        <div class="space-y-4">
          <For each={faqItems}>
            {(item, i) => (
              <details
                class="group p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-white/20 transition-colors"
                open={i() === 0}
              >
                <summary class="flex items-center justify-between gap-4 cursor-pointer list-none font-display font-semibold text-foreground">
                  {item.question}
                  <a-icon
                    name="chevron-down"
                    class="text-xl text-cyan-300 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p class="text-muted-foreground leading-relaxed mt-4">{item.answer}</p>
              </details>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
