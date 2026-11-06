import { iconUrl } from '@aura/ui/icon';
import { LightElement } from '@aura/widgets/light-element';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg';

import '@/components/common/notification-card';
import { notificationItems } from '@/lib/notifications';
import { createBlockiesImage } from '@/utils/image';
import './notifications.css';

@customElement('notifications-page')
export class NotificationsPage extends LightElement {
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
        <h1 class="a-head" data-level="1">Alerts</h1>

        <div class="filter">
          ${this.filters.map(
            (f) => html`
              <button
                class="a-button"
                type="button"
                data-size="sm"
                data-variant="${this.activeFilter === f.label ? 'default' : 'ghost'}"
                @click=${() => this.setFilter(f.label)}
              >
                ${f.label}
              </button>
            `,
          )}
        </div>

        ${
          filtered.length === 0
            ? html`
                <div class="a-card" data-variant="default">
                  <div class="empty">
                    <span
                      class="a-icon text-2xl"
                      aria-hidden="true"
                      style="--icon-url: url('${iconUrl('bell')}')"
                    ></span>
                    <p class="a-text" data-variant="muted">
                      No notifications yet.
                    </p>
                  </div>
                </div>
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
