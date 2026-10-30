import { css, html, LitElement, type CSSResultGroup } from 'lit';
import { customElement } from 'lit/decorators.js';
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg';

import '@/components/common/notification-card';
import { notificationItems } from '@/lib/notifications';
import { createBlockiesImage } from '@/utils/image';

@customElement('notifications-page')
export class NotificationsPage extends LitElement {
  static styles?: CSSResultGroup = css`
    section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    .filter {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter a-button {
      flex: 0 0 auto;
    }

    .filter a-button[variant='ghost']::part(button) {
      color: var(--muted-foreground);
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      color: var(--muted-foreground);
    }
  `;

  private activeFilter: string = 'All';

  private filters = [
    { label: 'All', type: null },
    { label: 'Score', type: 'score' },
    { label: 'Evaluations', type: 'evaluation' },
    { label: 'Level', type: 'level' },
  ];

  private setFilter(filter: string) {
    this.activeFilter = filter;
    this.requestUpdate();
  }

  protected render() {
    const items = notificationItems.get();
    const active = this.filters.find((f) => f.label === this.activeFilter);
    const filtered = active?.type
      ? items.filter((item) => item.changeType === active.type)
      : items;

    return html`
      <section>
        <a-head level="1">Alerts</a-head>

        <div class="filter">
          ${this.filters.map(
            (f) => html`
              <a-button
                size="sm"
                variant="${this.activeFilter === f.label ? 'default' : 'ghost'}"
                @click=${() => this.setFilter(f.label)}
              >
                ${f.label}
              </a-button>
            `,
          )}
        </div>

        ${
          filtered.length === 0
            ? html`
                <a-card variant="default">
                  <div class="empty">
                    <a-icon name="bell" size="md"></a-icon>
                    <a-text variant="muted">No notifications yet.</a-text>
                  </div>
                </a-card>
              `
            : filtered.map(
                (item) => html`
                  <notification-card
                    .userName="${item.profileId}"
                    .timestamp="${item.createdAt}"
                    .description="${item.description}"
                    .icon="${thumbsUpGreen}"
                    .profileImage="${createBlockiesImage(item.profileId)}"
                  ></notification-card>
                `,
              )
        }
      </section>
    `;
  }
}
