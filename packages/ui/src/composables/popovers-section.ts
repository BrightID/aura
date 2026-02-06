import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('popovers-section')
export class PopoversSectionElement extends LitElement {
  protected render() {
    return html`
      <a-head level="3"> Popovers Section </a-head>

      <a-popover side="bottom" align="center" side-offset="6">
        <button slot="trigger" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          Open Popover
        </button>

        <div slot="content">
          <div class="space-y-3">
            <h4 class="font-medium">Popover Title</h4>
            <p class="text-sm text-muted-foreground">
              This is a popover content area. You can put anything here — text, forms, images...
            </p>
            <button class="text-sm text-primary hover:underline">Learn more →</button>
          </div>
        </div>
      </a-popover>

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

          <p class="text-sm">The React Framework – created and maintained by @vercel.</p>

          <div class="flex gap-6 mt-4 text-sm text-muted-foreground">
            <div><span class="font-medium text-foreground">12k</span> Followers</div>
            <div><span class="font-medium text-foreground">289</span> Following</div>
          </div>
        </a-hover-card-content>
      </a-hover-card>
    `
  }
}
