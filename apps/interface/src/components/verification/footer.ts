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
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <span>Secured by Aura Network</span>
        <a href="https://brightid.gitbook.io/aura" target="_blank" rel="noopener noreferrer">
          Learn more
        </a>
      </div>
    `
  }
}
