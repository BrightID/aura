import { A } from '@solidjs/router';
import FadeIn from '@/components/motions/fade-in';
import Scale from '@/components/motions/scale';
import { createResource, Show } from 'solid-js';
import { checkIndexedDB } from '@/shared/lib/db-check';

const Splash = () => {
  const [dbHealthy] = createResource(checkIndexedDB);

  return (
    <Show
      when={dbHealthy() !== false}
      fallback={
        <div class="flex h-[calc(100vh-80px)] flex-col px-5 pt-16">
          <h2 class="a-head mb-5 text-5xl font-semibold tracking-tight">
            Aura
          </h2>
          <p class="a-text text-destructive" data-size="lg">
            IndexedDB is blocked. Please enable IndexedDB to use Aura.
          </p>
          <button
            class="a-button mt-10 w-full"
            type="button"
            data-size="lg"
            data-testid="db-refresh"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      }
    >
      <div class="flex min-h-dvh flex-col px-6 py-8 sm:px-10 sm:py-12">
        <section class="content pt-8 sm:pt-16">
          <FadeIn delay={0.1}>
            <h2
              class="a-head mb-5 text-5xl font-semibold tracking-tight"
              data-testid="login-title"
            >
              Aura
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p class="a-text mb-4 font-semibold" data-size="xl">
              Trust starts with you.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p class="a-text font-medium" data-size="lg">
              Build your reputation. Help your friends and family get Aura
              verified.
            </p>
          </FadeIn>
        </section>

        <img
          src={`${import.meta.env.BASE_URL}global/logo.png`}
          class="mx-auto my-12 rounded-3xl"
          width={150}
          height={150}
          alt="aura players"
        />

        <section class="mt-auto mb-8 text-center">
          <Scale delay={0.6}>
            <A href="/login">
              <button class="a-button w-full" type="button" data-size="lg">
                Get started
              </button>
            </A>
          </Scale>
        </section>
        <FadeIn delay={0.3}>
          <footer class="flex justify-between text-sm text-muted-foreground">
            <span class="flex gap-1">
              <p class="a-text font-light">Version</p>
              <p class="a-text">{__APP_VERSION__}</p>
            </span>
            <span class="flex gap-1">
              <p class="a-text text-muted-foreground">Powered by:</p>
              <p class="a-text font-light">BrightID</p>
            </span>
          </footer>
        </FadeIn>
      </div>
    </Show>
  );
};

export default Splash;
