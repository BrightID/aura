import { css, type CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('verification-footer')
export class VerificationFooterElement extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-size: inherit;
      padding: 0.625em 1.25em;
      border-top: 1px solid var(--border);
      background: color-mix(in srgb, var(--muted) 30%, transparent);
    }

    .footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
      font-size: 0.75em;
      color: var(--muted-foreground);
    }

    .icon {
      width: 0.875em;
      height: 0.875em;
      flex-shrink: 0;
    }

    a {
      color: var(--primary);
      text-decoration: none;
    }

    a:hover { text-decoration: underline; }
  `

  protected render() {
    return html`
      <div class="footer-row">
        <iconify-icon icon="lucide:lock" class="icon"></iconify-icon>
        <span>Secured by Aura Network</span>
        <a href="https://brightid.gitbook.io/aura" target="_blank" rel="noopener noreferrer">
          Learn more
        </a>
      </div>
    `
  }
}
