/**
 * Svelte action that reveals an element when it enters the viewport.
 * Usage: <section use:scrollReveal>
 */
export function scrollReveal(node: HTMLElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add("reveal-visible")
          node.classList.remove("reveal-hidden")
          observer.unobserve(node)
        }
      }
    },
    { threshold: 0.15 },
  )

  node.classList.add("reveal-hidden")
  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
    },
  }
}
