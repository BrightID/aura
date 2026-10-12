import Hero from './Hero';
import WhyAura from './WhyAura';
import HowItWorks from './HowItWorks';
import UseCases from './UseCases';
import FAQ from './FAQ';
import CTA from './CTA';

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <WhyAura />
      <UseCases />
      <HowItWorks />
      <FAQ />
      <CTA />
    </main>
  );
}
