import { css, html, LitElement, type CSSResultGroup } from "lit"
import { customElement } from "lit/decorators.js"
import { toast } from "../components"
import "../components/card"
import "../components/head"

@customElement("cards-section")
export class CardsSectionElement extends LitElement {
  static styles?: CSSResultGroup = css`
    a-card {
      display: flex;
      flex-direction: column;
      gap: var(--md);
    }

    a-text {
      font-weight: 600;
    }

    a-flex {
      margin-top: var(--lg);
    }
  `

  protected onClick() {
    toast("Clicked :Check:")
  }

  protected render() {
    return html`
      <a-head level="3"> Cards Preview </a-head>

      <a-card variant="default">
        <a-text>Sample card title</a-text>

        <a-input
          name="firstName"
          placeholder="Enter your name"
          label="First Name"
        ></a-input>

        <a-flex gap="4" justify="end">
          <a-button color="destructive"> Reject </a-button>

          <a-button @click=${this.onClick}> Accept </a-button>
        </a-flex>

        <div>
          <!-- inside <a-theme-provider> ... -->

          <a-badge>Default (muted)</a-badge>
          <a-badge variant="secondary">Secondary</a-badge>
          <a-badge variant="accent">Accent</a-badge>
          <a-badge variant="destructive">Destructive</a-badge>

          <a-badge variant="outline">Outline</a-badge>
          <a-badge variant="glass">Glass</a-badge>

          <a-badge size="sm">Small</a-badge>
          <a-badge rounded>Round</a-badge>
          <a-badge rounded variant="accent">Pill Accent</a-badge>

          <a-badge removable> Removable </a-badge>
        </div>
      </a-card>

      <a-head level="3">Glassified Card (Not working, TODO)</a-head>

      <a-card variant="glass">
        <a-text>Sample card title</a-text>

        <a-input
          name="firstName"
          placeholder="Enter your name"
          label="First Name"
        ></a-input>

        <a-flex gap="4" justify="end">
          <a-button color="destructive"> Reject </a-button>

          <a-button> Accept </a-button>
        </a-flex>
      </a-card>

      <a-hover-card openDelay="500" closeDelay="300" side="bottom">
        <a-hover-card-trigger slot="trigger">
          <a class="text-primary hover:underline">@nextjs</a>
        </a-hover-card-trigger>

        <a-hover-card-content slot="content">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold"
            >
              N
            </div>
            <div>
              <h4 class="font-semibold">Next.js</h4>
              <p class="text-sm text-muted-foreground">@nextjs</p>
            </div>
          </div>

          <p class="text-sm">
            The React Framework – created and maintained by @vercel.
          </p>

          <div class="flex gap-6 mt-4 text-sm text-muted-foreground">
            <div>
              <span class="font-medium text-foreground">12k</span> Followers
            </div>
            <div>
              <span class="font-medium text-foreground">289</span> Following
            </div>
          </div>
        </a-hover-card-content>
      </a-hover-card>
    `
  }
}
