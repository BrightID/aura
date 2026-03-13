import { css, html, LitElement, type CSSResultGroup } from 'lit'
import { customElement } from 'lit/decorators.js'
import thumbsUpGreen from '@/assets/icons/thumbs-up.svg'

import '@/components/common/notification-card'
import { notificationItems } from '@/lib/notifications'
import { createBlockiesImage } from '@/utils/image'

@customElement('notifications-page')
export class NotificationsPage extends LitElement {
  static styles?: CSSResultGroup = css`
    section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filter {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `

  private activeFilter: string = 'All'

  private filters = [
    { label: 'All', type: null },
    { label: 'Alert', type: 'alert' },
    { label: 'Evaluations', type: 'evaluation' },
    { label: 'Level', type: 'level' }
  ]

  private setFilter(filter: string) {
    this.activeFilter = filter
    this.requestUpdate()
  }

  protected render() {
    const items = notificationItems.get()
    const filtered =
      this.activeFilter === 'All'
        ? items
        : items.filter((item) => {
            if (this.activeFilter === 'Evaluations') return item.changeType === 'evaluation'
            if (this.activeFilter === 'Level') return item.changeType === 'level'
            return true
          })

    return html`
      <section>
        <a-head level="1">Notifications</a-head>

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
            `
          )}
        </div>

        ${filtered.length === 0
          ? html`
              <div style="text-align:center; margin: 48px 0; color: var(--muted-foreground)">
                <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3" />
                  <path d="M16 32h16M24 16v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3" />
                  <circle cx="24" cy="28" r="1.5" fill="currentColor" opacity="0.3" />
                </svg>
                <a-text variant="muted" style="margin-top: 12px; display: block">No notifications yet</a-text>
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
              `
            )}
      </section>
    `
  }
}
