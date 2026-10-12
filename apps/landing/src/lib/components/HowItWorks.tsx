export default function HowItWorks() {
  return (
    <section id="how-it-works" class="process-section page-width">
      <div class="process-intro">
        <p class="eyebrow">03 / INTEGRATE THE HUMAN SIGNAL</p>
        <h2>
          Your project.
          <br />
          Your rules.
          <br />
          <em>A shared network.</em>
        </h2>
        <p>
          Add Aura to your app’s participation flow. The network handles human
          evaluation; your project decides what verification it accepts.
        </p>
        <a class="text-link" href="/demo">
          Explore the integration demo <span aria-hidden="true">↗</span>
        </a>
        <div class="integration-flow" aria-label="Integration flow">
          <span>YOUR APP</span>
          <span aria-hidden="true">↓</span>
          <span>AURA VERIFICATION</span>
          <span aria-hidden="true">↓</span>
          <span>YOUR PARTICIPATION RULES</span>
        </div>
      </div>
      <ol class="process-list">
        <li>
          <span>01</span>
          <div>
            <h3>Create your project.</h3>
            <p>
              Use the dashboard to set up a project and choose the verification
              level your app requires.
            </p>
            <a class="text-link" href="/dashboard">
              Open the dashboard ↗
            </a>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Connect the verification flow.</h3>
            <p>
              Follow the developer documentation to integrate Aura verification
              into your application.
            </p>
            <a class="text-link" href="/docs">
              Read the integration docs ↗
            </a>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Make participation count.</h3>
            <p>
              Use the verification result in your app’s access or eligibility
              rules. People get verified through BrightID connections and Aura
              evaluations.
            </p>
            <a class="text-link" href="/interface/login">
              See the participant experience ↗
            </a>
          </div>
        </li>
      </ol>
    </section>
  );
}
