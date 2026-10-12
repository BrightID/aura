export default function Hero() {
  return (
    <section class="hero page-width">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="small-dot" /> DECENTRALIZED HUMAN VERIFICATION
        </p>
        <h1>
          Human trust.
          <br />
          <em>
            Open
            <br />
            infrastructure.
          </em>
        </h1>
        <p class="hero-description">
          Build for people, not an endless supply of wallets. Aura brings
          community-driven human verification to decentralized apps, governance,
          and shared resources.
        </p>
        <div class="hero-actions">
          <a class="action" href="/docs">
            Build with Aura <span aria-hidden="true">↗</span>
          </a>
          <a class="text-link" href="/interface/login">
            Get verified <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p class="hero-note">Built on BrightID. Evaluated by people.</p>
      </div>
      <figure class="trust-figure">
        <div class="figure-heading">
          <span>NETWORK / HUMAN TRUST</span>
          <span>SCHEMATIC 001</span>
        </div>
        <svg
          viewBox="0 0 520 520"
          role="img"
          aria-labelledby="connection-title connection-description"
        >
          <title id="connection-title">
            A shared trust network for decentralized applications
          </title>
          <desc id="connection-description">
            Independent evaluators connect through Aura to projects for
            governance, grants, and community access. This is a conceptual
            diagram, not live network activity.
          </desc>
          <g fill="none" stroke="#303431" stroke-width="1">
            <path d="M0 130H520M0 260H520M0 390H520M130 0V520M260 0V520M390 0V520" />
            <path d="M0 0L520 520M520 0L0 520" stroke-dasharray="2 8" />
          </g>
          <g fill="none" stroke="#7b8279" stroke-width="1.5">
            <path d="M82 142L204 92 260 260 82 142 82 355 260 260 204 92 423 165 260 260 417 385 423 165M82 355L210 435 260 260M210 435L417 385M204 92L82 355M82 142L423 165M82 355L417 385" />
          </g>
          <g fill="#161a17" stroke="#a0aa97" stroke-width="1.5">
            <path d="m82 109 29 17v33l-29 17-29-17v-33Z" />
            <path d="m204 59 29 17v33l-29 17-29-17V76Z" />
            <path d="m82 322 29 17v33l-29 17-29-17v-33Z" />
            <path d="m210 402 29 17v33l-29 17-29-17v-33Z" />
          </g>
          <g fill="#d7dfcd">
            <circle cx="82" cy="135" r="6" />
            <path d="M71 153q0-14 11-14t11 14Z" />
            <circle cx="204" cy="85" r="6" />
            <path d="M193 103q0-14 11-14t11 14Z" />
            <circle cx="82" cy="348" r="6" />
            <path d="M71 366q0-14 11-14t11 14Z" />
            <circle cx="210" cy="428" r="6" />
            <path d="M199 446q0-14 11-14t11 14Z" />
          </g>
          <g fill="#d9fa62" stroke="#d9fa62">
            <path d="m260 194 57 33v66l-57 33-57-33v-66Z" />
            <path
              d="m260 207 45 26v53l-45 26-45-26v-53Z"
              fill="none"
              stroke="#253024"
            />
          </g>
          <text
            x="260"
            y="270"
            text-anchor="middle"
            fill="#121512"
            font-family="sans-serif"
            font-size="30"
            font-weight="600"
            letter-spacing="-2"
          >
            aura
          </text>
          <g fill="#222820" stroke="#d9fa62">
            <rect x="375" y="137" width="96" height="55" />
            <rect x="365" y="357" width="105" height="55" />
          </g>
          <g
            fill="#d9fa62"
            font-family="monospace"
            font-size="10"
            text-anchor="middle"
          >
            <text x="423" y="169">
              GOVERNANCE
            </text>
            <text x="417" y="389">
              APPLICATIONS
            </text>
          </g>
          <g fill="#aab3a2" font-family="monospace" font-size="9">
            <text x="15" y="92">
              INDEPENDENT
            </text>
            <text x="15" y="106">
              EVALUATORS
            </text>
            <text x="300" y="465">
              SHARED VERIFICATION
            </text>
          </g>
          <g fill="#d9fa62">
            <rect x="152" y="113" width="5" height="5" />
            <rect x="319" y="207" width="5" height="5" />
            <rect x="172" y="302" width="5" height="5" />
            <rect x="335" y="319" width="5" height="5" />
          </g>
        </svg>
        <figcaption>
          <span>
            Distributed evaluation.
            <br />A shared foundation for your project.
          </span>
          <span>
            CONCEPTUAL MAP
            <br />
            NOT LIVE NETWORK DATA
          </span>
        </figcaption>
      </figure>
      <div class="hero-baseline">
        <span>01 / PEOPLE VERIFY PEOPLE</span>
        <span>02 / PROJECTS SET REQUIREMENTS</span>
        <span>03 / COMMUNITIES PARTICIPATE</span>
        <a href="#why" aria-label="Explore the protocol">
          ↓
        </a>
      </div>
    </section>
  );
}
