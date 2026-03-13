import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('verification-footer')
export class VerificationFooterElement extends LitElement {
  static styles?: CSSResultGroup | undefined = css`
    :host {
      padding: 1.25rem 0.75rem;
      font-size: var(--sm);
      color: var(--muted-foreground);
    }
    .icon {
      width: 0.875rem;
      height: 0.875rem;
    }
  `
  protected render() {
    return html` <a-flex align="center" justify="center" gap="4" class="wrapper">
      <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <span>Secured by Aura Network</span>
      <a
        href="https://brightid.gitbook.io/aura"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Learn more
      </a>
    </a-flex>`
  }
}
