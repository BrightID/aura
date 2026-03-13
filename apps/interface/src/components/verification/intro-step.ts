import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

const levelDescriptions = {
  1: 'Basic verification for general access',
  2: 'Enhanced verification for trusted features',
  3: 'Premium verification for full access'
}

@customElement('verification-intro')
export class IntroStep extends LitElement {
  @property({})
  appName!: string

  @property()
  appDescription?: string

  @property()
  appLogo?: string

  @property({ type: Number })
  requiredLevel!: 1 | 2 | 3

  static styles?: CSSResultGroup | undefined = css`
    :where(& > :not(:last-child)) {
      margin-bottom: 1.25rem;
    }

    .app-logo {
      width: 3rem;
      height: 3rem;
      border-radius: var(--xl);
      object-fit: cover;
    }
    .app-logo-text {
      background-color: var(--secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--lg);
      font-weight: bold;
      color: var(--foreground);
    }

    .flex-1 {
      flex: 1 1 auto;
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
  `

  protected render() {
    return html` 
      <div class="header">
        ${
          this.appLogo
            ? html` <img
                .src=${this.appLogo || '/placeholder.svg'}
                .alt=${this.appName}
                class=""
              />`
            : html` <div class="app-logo app-logo-text">${this.appName.charAt(0)}</div> `
        }
         
        <div class="flex-1">
          <h2 className="font-semibold text-foreground truncate">${this.appName}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2">
            ${this.appDescription}
          </p>
        </div>
      </div>

      <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Required Verification
          </span>
          <LevelBadge level={requiredLevel} size="sm" />
        </div>
        <p className="text-sm text-foreground">
          ${levelDescriptions[this.requiredLevel]}
        </p>
      </div>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
        <div className="flex items-center gap-2">
          <AuraLogo className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Powered by Aura
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aura is a decentralized network that verifies your unique humanity
          without exposing personal information.
        </p>
        <button
          @click=${this.onHowItWorks}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Learn how it works
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <a-button @click=${this.onContinue} class="w-full" size="lg">
        Verify with Aura
      </a-button>

      <p className="text-xs text-center text-muted-foreground">
        Your identity stays private. ${this.appName} only sees your verification
        level.
      </p>
    </div>`
  }

  protected onHowItWorks() {}

  protected onContinue() {}
}
