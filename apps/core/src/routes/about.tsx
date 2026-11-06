import FadeIn from '@/components/motions/fade-in';

// `about.tsx` => `/about`.
function About() {
  return (
    <div class="flex min-h-[calc(100vh-80px)] flex-col px-5.5 pt-16 pb-4">
      <section class="content mb-auto">
        <FadeIn delay={0.1}>
          <h2 class="a-head mb-6 text-5xl">About</h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p class="a-text font-medium" data-size="lg">
            Aura is a social consensus protocol where players evaluate each
            other to verify unique humans, built on BrightID.
          </p>
        </FadeIn>
      </section>

      <footer class="text-muted-foreground flex justify-between text-sm">
        <span class="flex gap-1">
          <p class="a-text font-light">Version</p>
          <p class="a-text">{__APP_VERSION__}</p>
        </span>
        <span class="flex gap-1">
          <p class="a-text text-muted-foreground">Powered by:</p>
          <p class="a-text font-light">BrightID</p>
        </span>
      </footer>
    </div>
  );
}

export default About;
