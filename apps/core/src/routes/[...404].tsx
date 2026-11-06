import { A } from '@solidjs/router';
import FadeIn from '@/components/motions/fade-in';

export default function NotFound() {
  return (
    <div class="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-6 px-5 text-center">
      <FadeIn delay={0.1}>
        <h2 class="a-head text-6xl">404</h2>
      </FadeIn>
      <FadeIn delay={0.15}>
        <p class="a-text font-medium" data-size="lg">
          This page doesn't exist.
        </p>
      </FadeIn>
      <FadeIn delay={0.2}>
        <A href="/home">
          <button class="a-button" type="button" data-size="lg">
            Go home
          </button>
        </A>
      </FadeIn>
    </div>
  );
}
