import { HeroSection } from "./components/hero-section"
import { ProblemSection } from "./components/problem-section"
import { SolutionSection } from "./components/solution-section"
import { HowItWorksSection } from "./components/how-it-works-section"
import { FeaturesSection } from "./components/features-section"
import { BusinessSection } from "./components/business-section"
import { CTASection } from "./components/cta-section"
import { ComparisonSection } from "./components/comparison-section"
import { ScrollAnimation } from "./components/bot-scroll-animation"

export default function Home() {
  return (
    <main className="">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonSection />
      <ScrollAnimation />
      <BusinessSection />
      <CTASection />
    </main>
  )
}
