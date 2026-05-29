import { counter } from "@/store/onboarding"

// `about.tsx` => `/about`.
function About() {
  // Same module-scoped store, different route — state is shared automatically.
  return (
    <section class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">About</h1>
      <p>This page reads the same store. Count is {counter.state.count}.</p>
    </section>
  )
}

export default About
