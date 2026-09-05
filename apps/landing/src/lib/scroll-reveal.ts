/**
 * SolidJS ref callback that reveals an element when it enters the viewport.
 * Usage: <section ref={scrollReveal}>
 */
export function scrollReveal(el: HTMLElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          el.classList.remove('reveal-hidden');
          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.15 },
  );

  el.classList.add('reveal-hidden');
  observer.observe(el);
}
