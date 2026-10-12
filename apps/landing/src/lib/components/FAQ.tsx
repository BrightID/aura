export default function FAQ() {
  return (
    <section id="faq" class="faq-section page-width">
      <div>
        <p class="eyebrow">04 / PROTOCOL NOTES</p>
        <h2>Before you build.</h2>
        <a class="text-link" href="/docs">
          Go deeper in the docs ↗
        </a>
      </div>
      <div class="faq-list">
        <details>
          <summary>
            What makes Aura decentralized?<span aria-hidden="true">+</span>
          </summary>
          <p>
            Evaluation is performed by a network of independent participants.
            BrightID connections and human evaluations provide the basis for
            verification, rather than a single company checking identity
            documents.
          </p>
        </details>
        <details>
          <summary>
            Why do I need BrightID?<span aria-hidden="true">+</span>
          </summary>
          <p>
            BrightID is the app where you create your identity and make social
            connections. Aura uses that foundation for its evaluation process.
          </p>
        </details>
        <details>
          <summary>
            Where can I use my verification?<span aria-hidden="true">+</span>
          </summary>
          <p>
            In apps and communities that integrate Aura. Verification
            requirements can differ between apps, so check the level each one
            accepts.
          </p>
        </details>
        <details>
          <summary>
            Can I build with Aura?<span aria-hidden="true">+</span>
          </summary>
          <p>
            Yes. Use the developer documentation and dashboard to add Aura
            verification to your project. You can also explore the demo
            integration before getting started.
          </p>
          <a class="text-link" href="/demo">
            Try the integration demo ↗
          </a>
        </details>
      </div>
    </section>
  );
}
