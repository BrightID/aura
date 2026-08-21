<script lang="ts">
  import Hero from "$lib/components/Hero.svelte"
  import WhyAura from "$lib/components/WhyAura.svelte"
  import Comparison from "$lib/components/Comparison.svelte"
  import HowItWorks from "$lib/components/HowItWorks.svelte"
  import UseCases from "$lib/components/UseCases.svelte"
  import FAQ from "$lib/components/FAQ.svelte"
  import CTA from "$lib/components/CTA.svelte"
</script>

<svelte:head>
  <title>Aura — Prove You're Human. Not Who You Are.</title>
  <meta
    name="description"
    content="Aura verifies real, unique humans through the people who already know them — no ID uploads, no biometric scans, no central database. Get verified once, use it anywhere."
  />
</svelte:head>

<main>
  <Hero />
  <WhyAura />
  <Comparison />
  <HowItWorks />
  <UseCases />
  <FAQ />
  <CTA />
</main>
