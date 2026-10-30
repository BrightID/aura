import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('verifier-card-skeleton')
export class VerifierCardSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .copy {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  render() {
    return html`
      <a-card variant="default">
        <div class="header">
          <a-skeleton style="width: 52px; height: 52px"></a-skeleton>
          <div class="copy">
            <a-skeleton style="width: 7rem; height: 1rem"></a-skeleton>
            <a-skeleton style="width: 4.5rem; height: 0.75rem"></a-skeleton>
          </div>
        </div>
        <a-skeleton style="height: 0.5rem"></a-skeleton>
      </a-card>
    `;
  }
}
