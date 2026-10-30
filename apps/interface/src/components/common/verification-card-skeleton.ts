import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('verification-card-skeleton')
export class VerificationCardSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `;

  render() {
    return html`
      <a-card variant="default">
        <div class="header">
          <a-skeleton style="width: 8rem; height: 1.125rem"></a-skeleton>
          <a-skeleton style="width: 5rem; height: 1.25rem"></a-skeleton>
        </div>
        <div class="stack">
          <a-skeleton style="width: 7rem; height: 0.875rem"></a-skeleton>
          <a-skeleton style="height: 0.5rem"></a-skeleton>
          <a-skeleton style="height: 2.25rem"></a-skeleton>
        </div>
      </a-card>
    `;
  }
}
